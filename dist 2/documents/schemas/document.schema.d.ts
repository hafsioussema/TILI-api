import { Document as MongooseDocument, Types } from 'mongoose';
import { DocumentType } from '../../common/enums/document.enum';
export type TiliDocumentDoc = TiliDocument & MongooseDocument;
export declare class TiliDocument {
    name: string;
    type: DocumentType;
    path: string;
    mimeType: string;
    size: number;
    version: number;
    projectId: Types.ObjectId;
    uploadedBy: Types.ObjectId;
    description?: string;
    isDeleted: boolean;
}
export declare const TiliDocumentSchema: import("mongoose").Schema<TiliDocument, import("mongoose").Model<TiliDocument, any, any, any, (MongooseDocument<unknown, any, TiliDocument, any, import("mongoose").DefaultSchemaOptions> & TiliDocument & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (MongooseDocument<unknown, any, TiliDocument, any, import("mongoose").DefaultSchemaOptions> & TiliDocument & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, TiliDocument>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<DocumentType, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    path?: import("mongoose").SchemaDefinitionProperty<string, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mimeType?: import("mongoose").SchemaDefinitionProperty<string, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    size?: import("mongoose").SchemaDefinitionProperty<number, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    version?: import("mongoose").SchemaDefinitionProperty<number, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    uploadedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, TiliDocument, MongooseDocument<unknown, {}, TiliDocument, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<TiliDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, TiliDocument>;
