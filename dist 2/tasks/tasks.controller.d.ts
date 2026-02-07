import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createDto: CreateTaskDto): Promise<import("./schemas/task.schema").TaskDoc>;
    findAll(query: QueryTasksDto): Promise<import("./schemas/task.schema").TaskDoc[]>;
    findOne(id: string): Promise<import("./schemas/task.schema").TaskDoc>;
    update(id: string, updateDto: UpdateTaskDto): Promise<import("./schemas/task.schema").TaskDoc>;
    remove(id: string): Promise<void>;
}
