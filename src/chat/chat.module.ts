import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenaiModule } from 'src/openai/openai.module';
import { ChatController } from './chat.controller';
import { Chat, Message } from './chat.entity';
import { ChatService } from './chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message]),
    ClientsModule.register([
      {
        name: 'LEXICON',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'lexicon',
            brokers: ['kafka:9092']
          },
          producerOnlyMode: true,
          consumer: {
            groupId: 'lexicon-consumer'
          },
        },
      },
    ]),
    HttpModule,
    OpenaiModule
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule { }
