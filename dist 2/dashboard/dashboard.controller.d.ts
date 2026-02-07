import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(user: any): Promise<{
        projects: {
            active: number;
            closed: number;
            archived: number;
            total: number;
        };
        documents: {
            byType: Record<string, number>;
            total: number;
        };
    }>;
    getActivity(user: any, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("../documents/schemas/document-history.schema").DocumentHistoryDoc, {}, import("mongoose").DefaultSchemaOptions> & import("../documents/schemas/document-history.schema").DocumentHistory & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
