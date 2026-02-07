import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    async getStats(@CurrentUser() user: any) {
        const userId = user.userId ?? user.sub;
        return this.dashboardService.getStats(userId, user.role);
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get global activity feed' })
    async getActivity(
        @CurrentUser() user: any,
        @Query('limit') limit?: number,
    ) {
        const userId = user.userId ?? user.sub;
        return this.dashboardService.getGlobalActivity(userId, user.role, limit);
    }
}
