import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { ConversationService } from './conversation.service';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => TasksModule),
    UsersModule,
  ],
  controllers: [BotController],
  providers: [BotService, ConversationService],
  exports: [BotService],
})
export class BotModule {}
