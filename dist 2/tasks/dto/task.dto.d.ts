import { TaskStatus, TaskPriority } from '../schemas/task.schema';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    projectId: string;
    order?: number;
    tags?: string[];
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    order?: number;
    tags?: string[];
}
export declare class QueryTasksDto {
    projectId?: string;
    status?: TaskStatus;
    assigneeId?: string;
}
