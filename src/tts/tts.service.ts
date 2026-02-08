import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

@Injectable()
export class TTSService {
    private readonly logger = new Logger(TTSService.name);
    private tempDir: string;

    constructor(private configService: ConfigService) {
        // Use system temp directory for audio files
        this.tempDir = path.join(os.tmpdir(), 'tili-tts');
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
        
        this.logger.log('✓ Edge TTS service initialized (FREE, no API key needed)');
    }

    /**
     * Synthesize text to speech using Microsoft Edge TTS (FREE!)
     * Supports Arabic and other languages
     * No API key or payment required
     */
    async synthesizeSpeech(
        text: string,
        languageCode: string = 'en-US',
        voiceName?: string,
    ): Promise<Buffer> {
        try {
            this.logger.log(`[TTS] Synthesizing: "${text.substring(0, 50)}..." (${languageCode})`);

            // Map our language codes to Edge TTS voice names
            const voiceMap: Record<string, string> = {
                'en': 'en-US-AriaNeural',          // English
                'fr': 'fr-FR-DeniseNeural',        // French
                'ar': 'ar-SA-LeenNeural',          // Arabic (Saudi Arabia) ✅ FREE
                'tn': 'ar-TN-AmeniNeural',         // Tunisian Arabic ✅ FREE
            };

            const finalVoiceName = voiceName || voiceMap[languageCode] || 'en-US-AriaNeural';

            this.logger.log(`[TTS] Using voice: ${finalVoiceName}`);

            // Generate unique filename for this synthesis
            const filename = `tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp3`;
            const outputPath = path.join(this.tempDir, filename);

            // Build edge-tts command
            // Escape text for shell
            const escapedText = text.replace(/'/g, "'\\''");
            const command = `npx edge-tts --voice "${finalVoiceName}" --text '${escapedText}' --write-media "${outputPath}"`;

            this.logger.log(`[TTS] Executing: ${command.substring(0, 100)}...`);

            // Execute edge-tts command
            await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });

            // Read the generated audio file
            const audioContent = fs.readFileSync(outputPath);

            if (!audioContent || audioContent.length === 0) {
                throw new Error('No audio content generated');
            }

            this.logger.log(`✓ TTS synthesis successful (${audioContent.length} bytes)`);

            // Clean up temp file
            fs.unlink(outputPath, (err) => {
                if (err) this.logger.warn(`Failed to delete temp file: ${err}`);
            });

            return audioContent;
        } catch (error) {
            this.logger.error('TTS synthesis failed:', error);
            throw error;
        }
    }

    /**
     * Get list of available voices for Edge TTS
     * These are all FREE - no payment needed!
     */
    async listVoices(): Promise<any[]> {
        const voices = [
            // English
            { lang: 'en-US', name: 'en-US-AriaNeural', displayName: 'Aria (US)' },
            { lang: 'en-US', name: 'en-US-GuyNeural', displayName: 'Guy (US)' },
            { lang: 'en-GB', name: 'en-GB-RyanNeural', displayName: 'Ryan (UK)' },
            { lang: 'en-GB', name: 'en-GB-SoniaNeural', displayName: 'Sonia (UK)' },

            // French
            { lang: 'fr-FR', name: 'fr-FR-DeniseNeural', displayName: 'Denise (France)' },
            { lang: 'fr-FR', name: 'fr-FR-HenriNeural', displayName: 'Henri (France)' },

            // Arabic - COMPLETELY FREE! 🇸🇦🇹🇳
            { lang: 'ar-SA', name: 'ar-SA-LeenNeural', displayName: 'Leen (Saudi Arabia)' },
            { lang: 'ar-SA', name: 'ar-SA-AmeenNeural', displayName: 'Ameen (Saudi Arabia)' },
            { lang: 'ar-TN', name: 'ar-TN-AmeniNeural', displayName: 'Ameni (Tunisia) 🇹🇳' },
            { lang: 'ar-EG', name: 'ar-EG-SalmaNeural', displayName: 'Salma (Egypt)' },
        ];

        this.logger.log(`Available voices: ${voices.length} (all completely FREE)`);
        return voices;
    }

    /**
     * Check if TTS is available
     * Edge TTS is always available - no setup needed!
     */
    isAvailable(): boolean {
        return true; // Edge TTS doesn't require any setup
    }
}
