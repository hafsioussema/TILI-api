import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentAction } from '../../common/enums/document.enum';

export type DocumentHistoryDoc = DocumentHistory & MongooseDocument;

@Schema({ timestamps: true })
export class DocumentHistory {
    @ApiProperty({ description: 'ID du document concerné' })
    @Prop({ type: Types.ObjectId, ref: 'TiliDocument', required: true })
    documentId: Types.ObjectId;

    @ApiProperty({ enum: DocumentAction, description: 'Action effectuée' })
    @Prop({ type: String, enum: DocumentAction, required: true })
    action: DocumentAction;

    @ApiProperty({ description: 'ID de l\'utilisateur ayant effectué l\'action' })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @ApiProperty({ description: 'Version du document au moment de l\'action' })
    @Prop({ required: true })
    version: number;

    @ApiPropertyOptional({ description: 'Métadonnées additionnelles' })
    @Prop({ type: Object })
    metadata?: Record<string, any>;
}

export const DocumentHistorySchema = SchemaFactory.createForClass(DocumentHistory);

// Index for efficient history queries
DocumentHistorySchema.index({ documentId: 1, createdAt: -1 });
DocumentHistorySchema.index({ userId: 1 });
