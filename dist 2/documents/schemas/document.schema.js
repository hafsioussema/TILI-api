"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiliDocumentSchema = exports.TiliDocument = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const document_enum_1 = require("../../common/enums/document.enum");
let TiliDocument = class TiliDocument {
    name;
    type;
    path;
    mimeType;
    size;
    version;
    projectId;
    uploadedBy;
    description;
    isDeleted;
};
exports.TiliDocument = TiliDocument;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom original du fichier' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TiliDocument.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: document_enum_1.DocumentType, description: 'Type de document' }),
    (0, mongoose_1.Prop)({ type: String, enum: document_enum_1.DocumentType, required: true }),
    __metadata("design:type", String)
], TiliDocument.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chemin de stockage du fichier' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TiliDocument.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type MIME du fichier' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TiliDocument.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Taille du fichier en bytes' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TiliDocument.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Numéro de version du document' }),
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], TiliDocument.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du projet associé' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Project', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TiliDocument.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de l\'utilisateur qui a uploadé le document' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TiliDocument.prototype, "uploadedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description du document' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], TiliDocument.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document supprimé (soft delete)' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], TiliDocument.prototype, "isDeleted", void 0);
exports.TiliDocument = TiliDocument = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TiliDocument);
exports.TiliDocumentSchema = mongoose_1.SchemaFactory.createForClass(TiliDocument);
exports.TiliDocumentSchema.index({ projectId: 1 });
exports.TiliDocumentSchema.index({ type: 1 });
exports.TiliDocumentSchema.index({ uploadedBy: 1 });
exports.TiliDocumentSchema.index({ isDeleted: 1 });
//# sourceMappingURL=document.schema.js.map