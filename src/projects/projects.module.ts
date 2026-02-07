import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsModule } from '../documents/documents.module';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './schemas/project.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Project.name, schema: ProjectSchema },
        ]),
        DocumentsModule,
        forwardRef(() => TasksModule),
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService],
    exports: [ProjectsService],
})
export class ProjectsModule { }
