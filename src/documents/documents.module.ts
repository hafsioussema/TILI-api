import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { TiliDocument, TiliDocumentSchema } from './schemas/document.schema';
import { DocumentHistory, DocumentHistorySchema } from './schemas/document-history.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TiliDocument.name, schema: TiliDocumentSchema },
            { name: DocumentHistory.name, schema: DocumentHistorySchema },
            { name: Project.name, schema: ProjectSchema },
        ]),
    ],
    controllers: [DocumentsController],
    providers: [DocumentsService],
    exports: [DocumentsService],
})
export class DocumentsModule { }
