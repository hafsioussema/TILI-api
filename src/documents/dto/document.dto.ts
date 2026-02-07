import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';
import { DocumentType } from '../../common/enums/document.enum';

export class CreateDocumentDto {
    @ApiProperty({ description: 'Nom du document' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: DocumentType, description: 'Type de document' })
    @IsEnum(DocumentType)
    type: DocumentType;

    @ApiPropertyOptional({ description: 'ID du projet associé' })
    @IsMongoId()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({ description: 'ID de la réunion associée' })
    @IsString()
    @IsOptional()
    meetingId?: string;

    @ApiPropertyOptional({ description: 'Description du document' })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateDocumentDto {
    @ApiPropertyOptional({ description: 'Nouveau nom du document' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ enum: DocumentType, description: 'Nouveau type' })
    @IsEnum(DocumentType)
    @IsOptional()
    type?: DocumentType;

    @ApiPropertyOptional({ description: 'Nouvelle description' })
    @IsString()
    @IsOptional()
    description?: string;
}

export class QueryDocumentsDto {
    @ApiPropertyOptional({ enum: DocumentType, description: 'Filtrer par type' })
    @IsEnum(DocumentType)
    @IsOptional()
    type?: DocumentType;

    @ApiPropertyOptional({ description: 'Filtrer par projet' })
    @IsMongoId()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({ description: 'Filtrer par réunion' })
    @IsString()
    @IsOptional()
    meetingId?: string;

    @ApiPropertyOptional({ description: 'Recherche par nom' })
    @IsString()
    @IsOptional()
    search?: string;
}
