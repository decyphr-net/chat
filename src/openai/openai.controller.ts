import { Body, Controller, Post } from '@nestjs/common';
import { ChatCompletionRequestDto } from './dto/create-chat-completion';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) { }

  @Post('chatCompletion')
  async createChatCompletion(@Body() body: ChatCompletionRequestDto) {
    return this.openaiService.createChatCompletion(body);
  }
}
