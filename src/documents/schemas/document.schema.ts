import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../../common/enums/document.enum';

export type TiliDocumentDoc = TiliDocument & MongooseDocument;

@Schema({ timestamps: true })
export class TiliDocument {
    @ApiProperty({ description: 'Nom original du fichier' })
    @Prop({ required: true })
    name: string;

    @ApiProperty({ enum: DocumentType, description: 'Type de document' })
    @Prop({ type: String, enum: DocumentType, required: true })
    type: DocumentType;

    @ApiProperty({ description: 'Chemin de stockage du fichier' })
    @Prop({ required: true })
    path: string;

    @ApiProperty({ description: 'Type MIME du fichier' })
    @Prop({ required: true })
    mimeType: string;

    @ApiProperty({ description: 'Taille du fichier en bytes' })
    @Prop({ required: true })
    size: number;

    @ApiProperty({ description: 'Numéro de version du document' })
    @Prop({ default: 1 })
    version: number;

    @ApiProperty({ description: 'ID du projet associé' })
    @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
    projectId: Types.ObjectId;

    @ApiPropertyOptional({ description: 'ID de la réunion associée' })
    @Prop({ type: String, required: false })
    meetingId?: string;

    @ApiProperty({ description: 'ID de l\'utilisateur qui a uploadé le document' })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    uploadedBy: Types.ObjectId;

    @ApiPropertyOptional({ description: 'Description du document' })
    @Prop()
    description?: string;

    @ApiProperty({ description: 'Document supprimé (soft delete)' })
    @Prop({ default: false })
    isDeleted: boolean;
}

export const TiliDocumentSchema = SchemaFactory.createForClass(TiliDocument);

// Indexes for efficient queries
TiliDocumentSchema.index({ projectId: 1 });
TiliDocumentSchema.index({ type: 1 });
TiliDocumentSchema.index({ uploadedBy: 1 });
TiliDocumentSchema.index({ isDeleted: 1 });
