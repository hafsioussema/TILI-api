import { Model } from 'mongoose';
import { TiliDocumentDoc } from './schemas/document.schema';
import { DocumentHistoryDoc } from './schemas/document-history.schema';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentsDto } from './dto/document.dto';
import { Role } from '../common/enums/role.enum';
import { ProjectDoc } from '../projects/schemas/project.schema';
export declare class DocumentsService {
    private documentModel;
    private historyModel;
    private projectModel;
    constructor(documentModel: Model<TiliDocumentDoc>, historyModel: Model<DocumentHistoryDoc>, projectModel: Model<ProjectDoc>);
    create(createDto: CreateDocumentDto, file: Express.Multer.File, userId: string, userRole: Role): Promise<TiliDocumentDoc>;
    findAll(query: QueryDocumentsDto, userId: string, userRole: Role): Promise<TiliDocumentDoc[]>;
    findOne(id: string, userId: string, userRole: Role): Promise<TiliDocumentDoc>;
    download(id: string, userId: string, userRole: Role): Promise<{
        path: string;
        name: string;
        mimeType: string;
    }>;
    update(id: string, updateDto: UpdateDocumentDto, file: Express.Multer.File | undefined, userId: string, userRole: Role): Promise<TiliDocumentDoc>;
    remove(id: string, userId: string, userRole: Role): Promise<void>;
    getHistory(id: string, userId: string, userRole: Role): Promise<DocumentHistoryDoc[]>;
    private logHistory;
    private checkProjectAccess;
}
