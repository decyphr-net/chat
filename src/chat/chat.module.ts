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
        name: 'WORD_MICROSERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'word',
            brokers: ['kafka:9092']
          },
          producerOnlyMode: true,
          consumer: {
            groupId: 'word-processor-consumer'
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
