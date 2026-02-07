import { DocumentType } from '../../common/enums/document.enum';
export declare class CreateDocumentDto {
    name: string;
    type: DocumentType;
    projectId: string;
    description?: string;
}
export declare class UpdateDocumentDto {
    name?: string;
    type?: DocumentType;
    description?: string;
}
export declare class QueryDocumentsDto {
    type?: DocumentType;
    projectId?: string;
    search?: string;
}
