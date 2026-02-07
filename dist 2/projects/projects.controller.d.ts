import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createDto: CreateProjectDto): Promise<import("./schemas/project.schema").ProjectDoc>;
    findAll(query: QueryProjectsDto, user: any): Promise<import("./schemas/project.schema").ProjectDoc[]>;
    getHistory(id: string, user: any): Promise<import("./projects.service").ProjectHistoryItem[]>;
    close(id: string, user: any): Promise<import("./schemas/project.schema").ProjectDoc>;
    findOne(id: string, user: any): Promise<import("./schemas/project.schema").ProjectDoc>;
    update(id: string, updateDto: UpdateProjectDto, user: any): Promise<import("./schemas/project.schema").ProjectDoc>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
