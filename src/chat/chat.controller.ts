import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Chat } from './chat.entity';
import { ChatService } from './chat.service';
import { CreateChatRequestDto } from './dtos/create-chat-request.dto';

@Controller('api/chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) { }

  /**
   * Get all chats for a given client
   *
   * @param clientId: The client ID UUID
   * @returns Promise<Chat[]>
   */
  @Get('clientId')
  async findAllByClientId(@Query() query): Promise<Chat[]> {
    return await this.chatService.findAllByClientId(query.clientId);
  }

  /**
   *Get all chats for a given client
   *
   * @returns Promise<Chat[]>
   */
  @Get()
  async findAll(): Promise<Chat[]> {
    return await this.chatService.findAll();
  }

  @Post()
  async create(
    @Body() createChatRequestDto: CreateChatRequestDto,
  ): Promise<Chat> {
    return await this.chatService.createNewChat(createChatRequestDto);
  }
}
