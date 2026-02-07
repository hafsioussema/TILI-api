
import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingsSchedulerService } from './meetings-scheduler.service';
import { PrismaService } from '../prisma.service';
import { TranscriptionService } from '../transcription/transcription.service';
import { AiSummaryService } from '../ai-summary/ai-summary.service';
import { UploadService } from '../upload/upload.service';
import { EmailModule } from '../email/email.module';
import { MeetingsGateway } from './meetings.gateway';

@Module({
  imports: [EmailModule],
  controllers: [MeetingsController],
  providers: [
    MeetingsService,
    MeetingsSchedulerService,
    PrismaService,
    TranscriptionService,
    AiSummaryService,
    UploadService,
    MeetingsGateway
  ],
  exports: [MeetingsService],
})
export class MeetingsModule { }
