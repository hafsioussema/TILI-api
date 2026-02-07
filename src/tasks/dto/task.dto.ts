import { IsString, IsEnum, IsOptional, IsDateString, IsMongoId, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';

export class CreateTaskDto {
    @ApiProperty({ description: 'Titre de la tâche' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiProperty({ enum: TaskPriority, default: TaskPriority.MEDIUM })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @ApiPropertyOptional({ description: 'Date d\'échéance' })
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiPropertyOptional({ description: 'ID de l\'assigné' })
    @IsMongoId()
    @IsOptional()
    assigneeId?: string;

    @ApiProperty({ description: 'ID du projet' })
    @IsMongoId()
    projectId: string;

    @ApiPropertyOptional({ description: 'Ordre' })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}

export class UpdateTaskDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: TaskStatus })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional({ enum: TaskPriority })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiPropertyOptional()
    @IsMongoId()
    @IsOptional()
    assigneeId?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}

export class QueryTasksDto {
    @ApiPropertyOptional()
    @IsMongoId()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({ enum: TaskStatus })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional()
    @IsMongoId()
    @IsOptional()
    assigneeId?: string;
}
