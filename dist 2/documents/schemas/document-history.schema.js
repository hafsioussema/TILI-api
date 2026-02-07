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
exports.DocumentHistorySchema = exports.DocumentHistory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const document_enum_1 = require("../../common/enums/document.enum");
let DocumentHistory = class DocumentHistory {
    documentId;
    action;
    userId;
    version;
    metadata;
};
exports.DocumentHistory = DocumentHistory;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du document concerné' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'TiliDocument', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentHistory.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: document_enum_1.DocumentAction, description: 'Action effectuée' }),
    (0, mongoose_1.Prop)({ type: String, enum: document_enum_1.DocumentAction, required: true }),
    __metadata("design:type", String)
], DocumentHistory.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de l\'utilisateur ayant effectué l\'action' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentHistory.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version du document au moment de l\'action' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DocumentHistory.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Métadonnées additionnelles' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], DocumentHistory.prototype, "metadata", void 0);
exports.DocumentHistory = DocumentHistory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DocumentHistory);
exports.DocumentHistorySchema = mongoose_1.SchemaFactory.createForClass(DocumentHistory);
exports.DocumentHistorySchema.index({ documentId: 1, createdAt: -1 });
exports.DocumentHistorySchema.index({ userId: 1 });
//# sourceMappingURL=document-history.schema.js.map