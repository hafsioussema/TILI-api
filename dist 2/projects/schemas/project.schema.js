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
exports.ProjectSchema = exports.Project = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const document_enum_1 = require("../../common/enums/document.enum");
let Project = class Project {
    name;
    description;
    status;
    managerId;
    members;
    startDate;
    endDate;
    progress;
};
exports.Project = Project;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom du projet' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description du projet' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: document_enum_1.ProjectStatus, description: 'Statut du projet' }),
    (0, mongoose_1.Prop)({ type: String, enum: document_enum_1.ProjectStatus, default: document_enum_1.ProjectStatus.ACTIVE }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du chef de projet' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "managerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Liste des membres (consultants) du projet' }),
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], Project.prototype, "members", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de début du projet' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Project.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de fin prévue' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Project.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Progression du projet (0-100)' }),
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Project.prototype, "progress", void 0);
exports.Project = Project = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Project);
exports.ProjectSchema = mongoose_1.SchemaFactory.createForClass(Project);
exports.ProjectSchema.index({ managerId: 1 });
exports.ProjectSchema.index({ status: 1 });
exports.ProjectSchema.index({ members: 1 });
//# sourceMappingURL=project.schema.js.map