import { Document as MongooseDocument, Types } from 'mongoose';
import { DocumentAction } from '../../common/enums/document.enum';
export type DocumentHistoryDoc = DocumentHistory & MongooseDocument;
export declare class DocumentHistory {
    documentId: Types.ObjectId;
    action: DocumentAction;
    userId: Types.ObjectId;
    version: number;
    metadata?: Record<string, any>;
}
export declare const DocumentHistorySchema: import("mongoose").Schema<DocumentHistory, import("mongoose").Model<DocumentHistory, any, any, any, (MongooseDocument<unknown, any, DocumentHistory, any, import("mongoose").DefaultSchemaOptions> & DocumentHistory & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (MongooseDocument<unknown, any, DocumentHistory, any, import("mongoose").DefaultSchemaOptions> & DocumentHistory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, DocumentHistory>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DocumentHistory, MongooseDocument<unknown, {}, DocumentHistory, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DocumentHistory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    documentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, DocumentHistory, MongooseDocument<unknown, {}, DocumentHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DocumentHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    action?: import("mongoose").SchemaDefinitionProperty<DocumentAction, DocumentHistory, MongooseDocument<unknown, {}, DocumentHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DocumentHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, DocumentHistory, MongooseDocument<unknown, {}, DocumentHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DocumentHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    version?: import("mongoose").SchemaDefinitionProperty<number, DocumentHistory, MongooseDocument<unknown, {}, DocumentHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DocumentHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any> | undefined, DocumentHistory, MongooseDocument<unknown, {}, DocumentHistory, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DocumentHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, DocumentHistory>;
