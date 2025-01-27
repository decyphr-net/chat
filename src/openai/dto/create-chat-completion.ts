import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatCompletionRequestDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsOptional()
  chatId?: number;
}