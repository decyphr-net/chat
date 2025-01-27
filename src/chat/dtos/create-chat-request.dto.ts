import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatRequestDto {
  @IsNotEmpty({ message: 'Field clientId is required' })
  @IsString()
  clientId: string;

  @IsNotEmpty({ message: 'Field botId is required' })
  @IsInt()
  botId: number;
}
