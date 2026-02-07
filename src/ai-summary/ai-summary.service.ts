
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiSummaryService {
    private readonly logger = new Logger(AiSummaryService.name);
    private readonly groqApiKey: string;

    constructor(private configService: ConfigService) {
        this.groqApiKey = this.configService.get<string>('GROQ_API_KEY') || '';
    }

    async generateSummary(transcript: string): Promise<string> {
        this.logger.log('Generating summary...');
        const prompt = `
      Tu es un expert en synthèse de réunions. Analyse la transcription suivante et génère un compte-rendu structuré en Markdown.
      
      Structure attendue:
      # Titre de la réunion
      ## 📝 Résumé Exécutif
      (3-4 phrases résumant l'essentiel)
      
      ## 🎯 Objectifs & Contexte
      
      ## 🗣️ Sujets Abordés
      - Point 1
      - Point 2
      
      ## ✅ Décisions Prises
      
      Transcription:
      ${transcript.substring(0, 25000)} // Truncate to avoid context limit if excessively large, though Groq has large context
    `;

        return this.callLlm(prompt);
    }

    async extractActions(transcript: string): Promise<any[]> {
        this.logger.log('Extracting actions...');
        const prompt = `
      Analyse la transcription suivante et extrait les actions à réaliser.
      Retourne UNIQUEMENT un tableau JSON valide. Pas de markdown, pas de texte avant/après.
      
      Format JSON attendu:
      [
        {
          "description": "Action à faire",
          "assignee": "Nom ou 'Non assigné'",
          "priority": "HIGH" | "MEDIUM" | "LOW",
          "dueDate": "YYYY-MM-DD" (ou null si non précisé)
        }
      ]

      Transcription:
      ${transcript.substring(0, 25000)}
    `;

        const content = await this.callLlm(prompt);
        try {
            // Cleaning potential markdown code blocks
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            this.logger.error('Failed to parse actions JSON', e);
            return [];
        }
    }

    private async callLlm(prompt: string): Promise<string> {
        if (!this.groqApiKey) {
            throw new Error('GROQ_API_KEY is not configured');
        }

        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile', // Updated to Llama 3.3
                temperature: 0.5,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.groqApiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            this.logger.error('LLM call failed', error.response?.data || error.message);
            throw error;
        }
    }
}
