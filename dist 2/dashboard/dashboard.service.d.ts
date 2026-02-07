import { Model, Types } from 'mongoose';
import { TiliDocumentDoc } from '../documents/schemas/document.schema';
import { ProjectDoc } from '../projects/schemas/project.schema';
import { DocumentHistory, DocumentHistoryDoc } from '../documents/schemas/document-history.schema';
import { Role } from '../common/enums/role.enum';
export declare class DashboardService {
    private documentModel;
    private projectModel;
    private historyModel;
    constructor(documentModel: Model<TiliDocumentDoc>, projectModel: Model<ProjectDoc>, historyModel: Model<DocumentHistoryDoc>);
    getStats(userId: string, userRole: Role): Promise<{
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
    getGlobalActivity(userId: string, userRole: Role, limit?: number): Promise<(import("mongoose").Document<unknown, {}, DocumentHistoryDoc, {}, import("mongoose").DefaultSchemaOptions> & DocumentHistory & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
