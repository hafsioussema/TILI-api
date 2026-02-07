import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    async create(@Body() createDto: CreateProjectDto, @CurrentUser() user: any) {
        const userId = user.userId ?? user.sub;
        return this.projectsService.create(createDto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'List all projects' })
    async findAll(
        @Query() query: QueryProjectsDto,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.projectsService.findAll(query, userId, user.role);
    }

    @Get(':id/history')
    @ApiOperation({ summary: 'Get project activity history' })
    async getHistory(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.projectsService.getHistory(id, userId, user.role);
    }

    @Post(':id/close')
    @ApiOperation({ summary: 'Close project (complete all tasks, set status to COMPLETED)' })
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    async close(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.projectsService.close(id, userId, user.role);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project details' })
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.projectsService.findOne(id, userId, user.role);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a project' })
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateProjectDto,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.projectsService.update(id, updateDto, userId, user.role);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a project' })
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    async remove(@Param('id') id: string, @CurrentUser() user: any) {
        const userId = user.userId ?? user.sub;
        await this.projectsService.remove(id, userId, user.role);
        return { message: 'Projet supprimé avec succès' };
    }
}
