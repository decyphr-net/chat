import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';
import { Chat, Message } from 'src/chat/chat.entity';
import { Repository } from 'typeorm';
import { ChatCompletionRequestDto } from './dto/create-chat-completion';

@Injectable()
export class OpenaiService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    private readonly openai: OpenAI) { }

  async sendMessageToOpenAI(messages: ChatCompletionRequestDto[]): Promise<ChatCompletion> {
    return await this.openai.chat.completions.create({
      messages: messages as ChatCompletionMessageParam[],
      model: 'gpt-4o-mini',
    });
  }

  async createChatCompletion(message) {
    const chat = await this.chatRepository.findOne(
      {
        where: {
          id: message.chatId
        },
        relations: {
          messages: true
        }
      }
    );
    const messages = chat.messages;

    const incomingMessage = await this.messageRepository.create({
      role: message.role,
      content: message.content
    })

    chat.messages.push(incomingMessage);
    await this.chatRepository.save(chat);

    const newMessage = await this.sendMessageToOpenAI(messages);

    const newMessageEntity = await this.messageRepository.create({
      role: newMessage.choices[0].message.role,
      content: newMessage.choices[0].message.content
    });

    await this.messageRepository.save(newMessageEntity);
    chat.messages.push(newMessageEntity);
    await this.chatRepository.save(chat);

    return messages;
  }
}
