import { Model } from 'mongoose';
import { ProjectDoc } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto } from './dto/project.dto';
import { Role } from '../common/enums/role.enum';
import { DocumentsService } from '../documents/documents.service';
import { TasksService } from '../tasks/tasks.service';
export interface ProjectHistoryItem {
    type: 'project_created' | 'document_added' | 'task_created';
    date: string;
    label: string;
    metadata?: {
        documentId?: string;
        documentName?: string;
        taskId?: string;
        taskTitle?: string;
        taskStatus?: string;
        userName?: string;
    };
}
export declare class ProjectsService {
    private projectModel;
    private readonly documentsService;
    private readonly tasksService;
    constructor(projectModel: Model<ProjectDoc>, documentsService: DocumentsService, tasksService: TasksService);
    create(createDto: CreateProjectDto): Promise<ProjectDoc>;
    findAll(query: QueryProjectsDto, userId: string, userRole: Role): Promise<ProjectDoc[]>;
    findOne(id: string, userId: string, userRole: Role): Promise<ProjectDoc>;
    update(id: string, updateDto: UpdateProjectDto, userId: string, userRole: Role): Promise<ProjectDoc>;
    remove(id: string): Promise<void>;
    close(projectId: string, userId: string, userRole: Role): Promise<ProjectDoc>;
    updateProgress(id: string): Promise<void>;
    getHistory(projectId: string, userId: string, userRole: Role): Promise<ProjectHistoryItem[]>;
}
