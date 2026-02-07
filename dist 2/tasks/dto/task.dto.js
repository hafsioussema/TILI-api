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
exports.QueryTasksDto = exports.UpdateTaskDto = exports.CreateTaskDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const task_schema_1 = require("../schemas/task.schema");
class CreateTaskDto {
    title;
    description;
    status;
    priority;
    dueDate;
    assigneeId;
    projectId;
    order;
    tags;
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Titre de la tâche' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: task_schema_1.TaskStatus, default: task_schema_1.TaskStatus.TODO }),
    (0, class_validator_1.IsEnum)(task_schema_1.TaskStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: task_schema_1.TaskPriority, default: task_schema_1.TaskPriority.MEDIUM }),
    (0, class_validator_1.IsEnum)(task_schema_1.TaskPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date d\'échéance' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de l\'assigné' }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID du projet' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ordre' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "tags", void 0);
class UpdateTaskDto {
    title;
    description;
    status;
    priority;
    dueDate;
    assigneeId;
    order;
    tags;
}
exports.UpdateTaskDto = UpdateTaskDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_schema_1.TaskStatus }),
    (0, class_validator_1.IsEnum)(task_schema_1.TaskStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_schema_1.TaskPriority }),
    (0, class_validator_1.IsEnum)(task_schema_1.TaskPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTaskDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTaskDto.prototype, "tags", void 0);
class QueryTasksDto {
    projectId;
    status;
    assigneeId;
}
exports.QueryTasksDto = QueryTasksDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTasksDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_schema_1.TaskStatus }),
    (0, class_validator_1.IsEnum)(task_schema_1.TaskStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTasksDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTasksDto.prototype, "assigneeId", void 0);
//# sourceMappingURL=task.dto.js.map