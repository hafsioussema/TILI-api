import {
    Controller,
    Post,
    Body,
    Get,
    Res,
    UseGuards,
    Query,
    BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TTSService } from './tts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Text-to-Speech')
@Controller('tts')
export class TTSController {
    constructor(private readonly ttsService: TTSService) {}

    /**
     * Check if TTS is available
     */
    @Get('health')
    @ApiOperation({ summary: 'Check if TTS service is available' })
    @ApiResponse({ status: 200, description: 'TTS is available' })
    @ApiResponse({ status: 503, description: 'TTS not available' })
    health() {
        if (!this.ttsService.isAvailable()) {
            return { available: false, message: 'Google Cloud credentials not configured' };
        }
        return { available: true, message: 'TTS service ready' };
    }

    /**
     * Synthesize text to speech
     * Returns audio stream (MP3)
     */
    @Post('speak')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Synthesize text to speech' })
    @ApiResponse({ status: 200, description: 'Audio stream (MP3)', type: 'application/octet-stream' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async synthesizeSpeech(
        @Body() body: { text: string; languageCode?: string; voiceName?: string },
        @Res() res: Response,
    ) {
        const { text, languageCode = 'en', voiceName } = body;

        if (!text || text.trim().length === 0) {
            throw new BadRequestException('Text is required and cannot be empty');
        }

        if (text.length > 5000) {
            throw new BadRequestException('Text exceeds maximum length of 5000 characters');
        }

        try {
            const audioContent = await this.ttsService.synthesizeSpeech(text, languageCode, voiceName);

            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioContent.length,
                'Cache-Control': 'public, max-age=3600',
            });

            res.send(audioContent);
        } catch (error) {
            throw new BadRequestException(`TTS synthesis failed: ${error.message}`);
        }
    }

    /**
     * List available voices for a language
     * All voices are COMPLETELY FREE - no payment needed!
     */
    @Get('voices')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List available voices (all FREE with Edge TTS)' })
    @ApiResponse({ status: 200, description: 'List of free voices' })
    async listVoices(@Query('languageCode') languageCode?: string) {
        try {
            const allVoices = await this.ttsService.listVoices();
            const voices = languageCode
                ? allVoices.filter(v => v.lang.startsWith(languageCode))
                : allVoices;
            return { 
                voices,
                count: voices.length,
                note: '✓ All voices are completely FREE with Microsoft Edge TTS - no payment required!'
            };
        } catch (error) {
            throw new BadRequestException(`Failed to list voices: ${error.message}`);
        }
    }
}
