import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TTSService } from './tts.service';
import { TTSController } from './tts.controller';

@Module({
    imports: [ConfigModule],
    providers: [TTSService],
    controllers: [TTSController],
    exports: [TTSService],
})
export class TTSModule {}
