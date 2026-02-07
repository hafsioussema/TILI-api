import { ProjectStatus } from '../../common/enums/document.enum';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    managerId: string;
    members?: string[];
    startDate?: Date;
    endDate?: Date;
    progress?: number;
}
export declare class UpdateProjectDto {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    members?: string[];
    endDate?: Date;
    progress?: number;
}
export declare class QueryProjectsDto {
    status?: ProjectStatus;
    search?: string;
}
