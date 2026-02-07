import { BotService } from './bot.service';
import { BotChatDto } from './dto/bot.dto';
import { Role } from '../common/enums/role.enum';
export declare class BotController {
    private readonly botService;
    constructor(botService: BotService);
    chat(dto: BotChatDto, user: {
        userId?: string;
        sub?: string;
        role: Role;
    }): Promise<{
        reply: string;
    }>;
}
