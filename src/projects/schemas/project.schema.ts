import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../../common/enums/document.enum';

export type ProjectDoc = Project & MongooseDocument;

@Schema({ timestamps: true })
export class Project {
    @ApiProperty({ description: 'Nom du projet' })
    @Prop({ required: true })
    name: string;

    @ApiPropertyOptional({ description: 'Description du projet' })
    @Prop()
    description?: string;

    @ApiProperty({ enum: ProjectStatus, description: 'Statut du projet' })
    @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.ACTIVE })
    status: ProjectStatus;

    @ApiProperty({ description: 'ID du chef de projet' })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    managerId: Types.ObjectId;

    @ApiProperty({ description: 'Liste des membres (consultants) du projet' })
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    members: Types.ObjectId[];

    @ApiPropertyOptional({ description: 'Date de début du projet' })
    @Prop()
    startDate?: Date;

    @ApiPropertyOptional({ description: 'Date de fin prévue' })
    @Prop()
    endDate?: Date;

    @ApiProperty({ description: 'Progression du projet (0-100)' })
    @Prop({ default: 0, min: 0, max: 100 })
    progress: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes
ProjectSchema.index({ managerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ members: 1 });
