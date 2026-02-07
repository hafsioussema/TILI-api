import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: 'Créer une nouvelle tâche' })
    async create(@Body() createDto: CreateTaskDto) {
        return this.tasksService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lister les tâches avec filtres' })
    async findAll(@Query() query: QueryTasksDto) {
        return this.tasksService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtenir les détails d\'une tâche' })
    async findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Mettre à jour une tâche' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateTaskDto) {
        return this.tasksService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer une tâche' })
    async remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}
