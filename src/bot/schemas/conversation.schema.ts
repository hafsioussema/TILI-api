import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';

export type ConversationDoc = Conversation & MongooseDocument;

@Schema({ _id: false })
export class ConversationMessage {
  @Prop({ required: true, enum: ['user', 'assistant', 'system'] })
  role: 'user' | 'assistant' | 'system';

  @Prop({ required: true })
  content: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

const ConversationMessageSchema = SchemaFactory.createForClass(ConversationMessage);

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [ConversationMessageSchema], default: [] })
  messages: ConversationMessage[];

  @Prop({ default: 100 })
  maxMessages: number;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ userId: 1 });
