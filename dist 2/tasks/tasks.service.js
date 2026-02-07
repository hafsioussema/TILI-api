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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("./schemas/task.schema");
const projects_service_1 = require("../projects/projects.service");
let TasksService = class TasksService {
    taskModel;
    projectsService;
    constructor(taskModel, projectsService) {
        this.taskModel = taskModel;
        this.projectsService = projectsService;
    }
    async create(createDto) {
        const task = new this.taskModel({
            ...createDto,
            projectId: new mongoose_2.Types.ObjectId(createDto.projectId),
            assigneeId: createDto.assigneeId ? new mongoose_2.Types.ObjectId(createDto.assigneeId) : undefined,
        });
        const savedTask = await task.save();
        await this.projectsService.updateProgress(createDto.projectId);
        return savedTask;
    }
    async findAll(query) {
        const filter = {};
        if (query.projectId)
            filter.projectId = new mongoose_2.Types.ObjectId(query.projectId);
        if (query.status)
            filter.status = query.status;
        if (query.assigneeId)
            filter.assigneeId = new mongoose_2.Types.ObjectId(query.assigneeId);
        return this.taskModel
            .find(filter)
            .populate('assigneeId', 'nom prenom email')
            .sort({ order: 1, createdAt: -1 })
            .exec();
    }
    async findOne(id) {
        const task = await this.taskModel.findById(id).populate('assigneeId', 'nom prenom email').exec();
        if (!task)
            throw new common_1.NotFoundException('Tâche non trouvée');
        return task;
    }
    async update(id, updateDto) {
        const updateData = { ...updateDto };
        if (updateData.assigneeId)
            updateData.assigneeId = new mongoose_2.Types.ObjectId(updateData.assigneeId);
        const task = await this.taskModel.findByIdAndUpdate(id, updateData, { new: true }).populate('assigneeId', 'nom prenom email').exec();
        if (!task)
            throw new common_1.NotFoundException('Tâche non trouvée');
        await this.projectsService.updateProgress(task.projectId.toString());
        return task;
    }
    async remove(id) {
        const task = await this.taskModel.findById(id).exec();
        if (!task)
            throw new common_1.NotFoundException('Tâche non trouvée');
        const projectId = task.projectId.toString();
        await this.taskModel.findByIdAndDelete(id).exec();
        await this.projectsService.updateProgress(projectId);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        projects_service_1.ProjectsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map