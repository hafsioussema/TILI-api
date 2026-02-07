
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

@Injectable()
export class TranscriptionService {
    private readonly logger = new Logger(TranscriptionService.name);
    private readonly groqApiKey: string;

    constructor(private configService: ConfigService) {
        this.groqApiKey = this.configService.get<string>('GROQ_API_KEY') || '';
    }

    async transcribe(filePath: string): Promise<{ text: string; segments: any[] }> {
        this.logger.log(`Starting transcription for ${filePath}`);

        if (!this.groqApiKey) {
            throw new Error('GROQ_API_KEY is not configured');
        }

        try {
            const form = new FormData();
            form.append('file', fs.createReadStream(filePath));
            form.append('model', 'whisper-large-v3-turbo'); // Updated from decommissioned distil model
            form.append('response_format', 'verbose_json');
            form.append('language', 'fr'); // Start with French as requested or auto

            const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${this.groqApiKey}`,
                },
            });

            this.logger.log('Transcription completed');
            return {
                text: response.data.text,
                segments: response.data.segments,
            };
        } catch (error) {
            this.logger.error('Transcription failed', error.response?.data || error.message);
            throw error;
        }
    }
}
