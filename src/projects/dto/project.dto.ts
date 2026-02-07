import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsArray,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../../common/enums/document.enum';

export class CreateProjectDto {
  @ApiProperty({ description: 'Nom du projet' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description du projet' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description:
      'ID du chef de projet (si absent, le créateur est associé automatiquement)',
  })
  @IsMongoId()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({ description: 'Liste des IDs des membres' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  @ApiPropertyOptional({ description: 'Date de début' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Date de fin prévue' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Progression du projet (0-100)' })
  @IsOptional()
  progress?: number;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: 'Nom du projet' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description du projet' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, description: 'Statut du projet' })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'ID du chef de projet' })
  @IsMongoId()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({ description: 'Liste des IDs des membres' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  @ApiPropertyOptional({ description: 'Date de fin prévue' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Progression du projet (0-100)' })
  @IsOptional()
  progress?: number;
}

export class QueryProjectsDto {
  @ApiPropertyOptional({
    enum: ProjectStatus,
    description: 'Filtrer par statut',
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'Recherche par nom' })
  @IsString()
  @IsOptional()
  search?: string;
}
