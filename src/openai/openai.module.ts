import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Chat, Message } from 'src/chat/chat.entity';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';

@Module({
  controllers: [OpenaiController],
  imports: [ConfigModule, TypeOrmModule.forFeature([Chat, Message]),],
  providers: [
    OpenaiService,
    {
      provide: OpenAI,
      useFactory: (configService: ConfigService) =>
        new OpenAI({ apiKey: configService.getOrThrow('OPENAI_API_KEY') }),
      inject: [ConfigService],
    },
  ],
  exports: [OpenaiService]
})
export class OpenaiModule { }
