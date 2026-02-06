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
    async create(@Body() createDto: CreateProjectDto) {
        return this.projectsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all projects' })
    async findAll(
        @Query() query: QueryProjectsDto,
        @CurrentUser() user: any,
    ) {
        return this.projectsService.findAll(query, user.sub, user.role);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project details' })
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        return this.projectsService.findOne(id, user.sub, user.role);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a project' })
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateProjectDto,
        @CurrentUser() user: any,
    ) {
        return this.projectsService.update(id, updateDto, user.sub, user.role);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a project' })
    @Roles(Role.ADMIN)
    async remove(@Param('id') id: string) {
        await this.projectsService.remove(id);
        return { message: 'Projet supprimé avec succès' };
    }
}
