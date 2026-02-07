import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BotService } from './bot.service';
import { BotChatDto } from './dto/bot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('TILIBOT')
@ApiBearerAuth()
@Controller('bot')
@UseGuards(JwtAuthGuard)
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get('conversation')
  @ApiOperation({ summary: 'Récupérer l\'historique de la conversation TILIBOT' })
  async getConversation(
    @CurrentUser() user: { userId?: string; sub?: string },
  ) {
    const userId = user.userId ?? user.sub ?? '';
    return this.botService.getConversation(userId);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Envoyer un message à TILIBOT et recevoir une réponse (CRUD réel projets/tâches)' })
  async chat(
    @Body() dto: BotChatDto,
    @CurrentUser() user: { userId?: string; sub?: string; role: Role },
  ) {
    const userId = user.userId ?? user.sub ?? '';
    const userRole = (user.role as Role) || Role.CONSULTANT;
    return this.botService.chat(
      { message: dto.message, history: dto.history },
      userId,
      userRole,
    );
  }
}
