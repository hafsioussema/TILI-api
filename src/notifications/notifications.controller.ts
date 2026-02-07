import { Controller, Get, Post, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.notificationsService.findAllByUser(user.email);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Post('read-all')
    markAllAsRead(@CurrentUser() user: any) {
        return this.notificationsService.markAllAsRead(user.email);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.notificationsService.delete(id);
    }
}
