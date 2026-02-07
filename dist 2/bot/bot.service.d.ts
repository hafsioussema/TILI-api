import { ConfigService } from '@nestjs/config';
import { Role } from '../common/enums/role.enum';
export interface BotMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface BotChatDto {
    message: string;
    history?: BotMessage[];
}
export declare class BotService {
    private readonly configService;
    private groq;
    constructor(configService: ConfigService);
    private getRoleContext;
    chat(dto: BotChatDto, userRole: Role): Promise<{
        reply: string;
    }>;
}
