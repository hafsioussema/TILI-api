import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentsDto } from './dto/document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(file: Express.Multer.File, createDto: CreateDocumentDto, user: any): Promise<import("./schemas/document.schema").TiliDocumentDoc>;
    findAll(query: QueryDocumentsDto, user: any): Promise<import("./schemas/document.schema").TiliDocumentDoc[]>;
    findOne(id: string, user: any): Promise<import("./schemas/document.schema").TiliDocumentDoc>;
    download(id: string, user: any, res: Response): Promise<void>;
    getHistory(id: string, user: any): Promise<import("./schemas/document-history.schema").DocumentHistoryDoc[]>;
    update(id: string, updateDto: UpdateDocumentDto, file: Express.Multer.File, user: any): Promise<import("./schemas/document.schema").TiliDocumentDoc>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
}
