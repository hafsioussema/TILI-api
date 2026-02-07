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
exports.QueryProjectsDto = exports.UpdateProjectDto = exports.CreateProjectDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const document_enum_1 = require("../../common/enums/document.enum");
class CreateProjectDto {
    name;
    description;
    managerId;
    members;
    startDate;
    endDate;
    progress;
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom du projet' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description du projet' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du chef de projet' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "managerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Liste des IDs des membres' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "members", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de début' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateProjectDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de fin prévue' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateProjectDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Progression du projet (0-100)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "progress", void 0);
class UpdateProjectDto {
    name;
    description;
    status;
    members;
    endDate;
    progress;
}
exports.UpdateProjectDto = UpdateProjectDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nom du projet' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProjectDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description du projet' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProjectDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: document_enum_1.ProjectStatus, description: 'Statut du projet' }),
    (0, class_validator_1.IsEnum)(document_enum_1.ProjectStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProjectDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Liste des IDs des membres' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateProjectDto.prototype, "members", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de fin prévue' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateProjectDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Progression du projet (0-100)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateProjectDto.prototype, "progress", void 0);
class QueryProjectsDto {
    status;
    search;
}
exports.QueryProjectsDto = QueryProjectsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: document_enum_1.ProjectStatus, description: 'Filtrer par statut' }),
    (0, class_validator_1.IsEnum)(document_enum_1.ProjectStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryProjectsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Recherche par nom' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryProjectsDto.prototype, "search", void 0);
//# sourceMappingURL=project.dto.js.map