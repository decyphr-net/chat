import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, map } from 'rxjs';
import { ChatCompletionRequestDto } from 'src/openai/dto/create-chat-completion';
import { OpenaiService } from 'src/openai/openai.service';
import { Repository } from 'typeorm';
import { Chat, Message } from './chat.entity';
import { Bot } from './dtos/bot.dto';
import { CreateChatRequestDto } from './dtos/create-chat-request.dto';


@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    @Inject('WORD_MICROSERVICE') private readonly wordClient: ClientKafka,
    private readonly httpService: HttpService,
    private readonly openaiService: OpenaiService,
  ) { }

  /**
   * Get Bot Data
   * @param id: The ID of the bot to retrieve
   * @returns Bot
   */
  async getBotData(id: number): Promise<Bot> {
    return await firstValueFrom(
      this.httpService
        .get(`http://bots:3000/bots/${id}`)
        .pipe(map((response) => response.data)),
    );
  }

  createChatPrompt(bot: Bot): string {
    return `
      You are a calling a friend that has moved to your neighbourhood from an english
      speaking country. you speak ${bot.language} use simple sentences to help your new
      friend as they are just beginning to learn the language. offer help if they are
      regularly getting things incorrect. use the below persona to generate
      conversation, talk about your interests, things that are happening in your life,
      ask your new neighbour about their life and interest, invite them to spend time
      with you, etc:

      name: ${bot.name}
      age: ${bot.age}
      gender: ${bot.gender}
      location: ${bot.city} (${bot.region})
      occupation: ${bot.occupation}
      background: ${bot.background}
      hobbies: ${bot.hobbies}
      personal: ${bot.personal}
      language: ${bot.language}
      `;
  }

  generateChatCompletionRequestDto(
    role: string, content: string, chatId: number
  ): ChatCompletionRequestDto[] {
    const chatCompletionDto = new ChatCompletionRequestDto();
    chatCompletionDto.role = role;
    chatCompletionDto.content = content;
    chatCompletionDto.chatId = chatId;
    return [chatCompletionDto]
  }

  async createNewChat(createChatRequestDto: CreateChatRequestDto): Promise<Chat> {
    // Get the data for the provided bot and include that data in the prompt
    const bot = await this.getBotData(createChatRequestDto.botId);
    const prompt = this.createChatPrompt(bot);

    // Create the message, using the prompt and the `system` role
    const message = this.messageRepository.create({
      role: 'system',
      content: prompt,
    });

    // Create the new chat
    const chat = this.chatRepository.create({
      clientId: createChatRequestDto.clientId,
      botId: createChatRequestDto.botId,
      messages: [message]
    });
    const initialChat = await this.chatRepository.save(chat);

    // Initialise the conversation with openAI
    const firstMessage = await this.openaiService.sendMessageToOpenAI(
      this.generateChatCompletionRequestDto(message.role, message.content, +chat.id)
    );

    // First message generated as part of the actual conversation, add it to the chat,
    // save the chat and send the new statement to Kafka
    const firstMessageEntity = this.messageRepository.create({
      role: firstMessage.choices[0].message.role,
      content: firstMessage.choices[0].message.content,
    });
    initialChat.messages = [...initialChat.messages, firstMessageEntity];
    await this.chatRepository.save(initialChat);
    this.wordClient.emit(
      'create_statement',
      JSON.stringify(
        {
          statement: firstMessageEntity.content,
          language: bot.language,
          timestamp: Date.now().toString(),
          source: 'chat'
        }
      )
    );
    return initialChat;
  }

  async findAllByClientId(clientId: string): Promise<Chat[]> {
    return await this.chatRepository.find(
      {
        where: {
          clientId: clientId
        },
        relations: {
          messages: true
        }
      }
    );
  }

  async findAll(): Promise<Chat[]> {
    return await this.chatRepository.find({ relations: { messages: true } });
  }
}
