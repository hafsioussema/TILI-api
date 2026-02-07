import { Model } from 'mongoose';
import { TaskDoc } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './dto/task.dto';
import { ProjectsService } from '../projects/projects.service';
export declare class TasksService {
    private taskModel;
    private projectsService;
    constructor(taskModel: Model<TaskDoc>, projectsService: ProjectsService);
    create(createDto: CreateTaskDto): Promise<TaskDoc>;
    findAll(query: QueryTasksDto): Promise<TaskDoc[]>;
    findOne(id: string): Promise<TaskDoc>;
    update(id: string, updateDto: UpdateTaskDto): Promise<TaskDoc>;
    remove(id: string): Promise<void>;
}
