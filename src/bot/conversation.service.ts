import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDoc } from './schemas/conversation.schema';

export interface BotMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ConversationService {
  private readonly maxMessages = 100;

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDoc>,
  ) {}

  async getMessages(userId: string): Promise<BotMessageInput[]> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') return [];
    let userObjectId: Types.ObjectId;
    try {
      userObjectId = new Types.ObjectId(userId.trim());
    } catch {
      return [];
    }
    const conv = await this.conversationModel
      .findOne({ userId: userObjectId })
      .exec();
    if (!conv || !conv.messages?.length) return [];
    return conv.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));
  }

  async appendMessages(
    userId: string,
    newMessages: BotMessageInput[],
  ): Promise<void> {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') return;
    let userObjectId: Types.ObjectId;
    try {
      userObjectId = new Types.ObjectId(userId.trim());
    } catch {
      return;
    }
    const docs = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: new Date(),
    }));

    const conv = await this.conversationModel.findOne({ userId: userObjectId }).exec();
    if (!conv) {
      await this.conversationModel.create({
        userId: userObjectId,
        messages: docs,
        maxMessages: this.maxMessages,
      });
      return;
    }

    const combined = [...(conv.messages || []), ...docs];
    const trimmed = combined.slice(-this.maxMessages);
    conv.messages = trimmed;
    await conv.save();
  }
}
