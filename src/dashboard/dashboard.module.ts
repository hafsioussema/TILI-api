import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TiliDocument, TiliDocumentSchema } from '../documents/schemas/document.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { DocumentHistory, DocumentHistorySchema } from '../documents/schemas/document-history.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TiliDocument.name, schema: TiliDocumentSchema },
            { name: Project.name, schema: ProjectSchema },
            { name: DocumentHistory.name, schema: DocumentHistorySchema },
        ]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
