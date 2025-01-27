import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation
} from 'typeorm';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'clientId', nullable: false })
  clientId: string;

  @Column({ name: 'botId', nullable: false })
  botId: number;

  @OneToMany(() => Message, (message) => message.chat, { cascade: true, })
  messages: Relation<Message>[];
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role', nullable: false })
  role: string;

  @Column({ name: 'message', nullable: false, length: 2000 })
  content: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
}
