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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const project_schema_1 = require("./schemas/project.schema");
const role_enum_1 = require("../common/enums/role.enum");
const document_enum_1 = require("../common/enums/document.enum");
const documents_service_1 = require("../documents/documents.service");
const tasks_service_1 = require("../tasks/tasks.service");
let ProjectsService = class ProjectsService {
    projectModel;
    documentsService;
    tasksService;
    constructor(projectModel, documentsService, tasksService) {
        this.projectModel = projectModel;
        this.documentsService = documentsService;
        this.tasksService = tasksService;
    }
    async create(createDto) {
        const project = new this.projectModel({
            ...createDto,
            managerId: new mongoose_2.Types.ObjectId(createDto.managerId),
            members: createDto.members?.map(m => new mongoose_2.Types.ObjectId(m)) || [],
        });
        const savedProject = await project.save();
        return this.findOne(savedProject._id.toString(), '', role_enum_1.Role.ADMIN);
    }
    async findAll(query, userId, userRole) {
        const filter = {};
        if (query.status) {
            filter.status = query.status;
        }
        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }
        if (userRole !== role_enum_1.Role.ADMIN) {
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            filter.$or = [
                { managerId: userObjectId },
                { members: userObjectId },
            ];
        }
        return this.projectModel
            .find(filter)
            .populate('managerId', 'nom prenom email')
            .populate('members', 'nom prenom email')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findOne(id, userId, userRole) {
        const project = await this.projectModel
            .findById(id)
            .populate('managerId', 'nom prenom email')
            .populate('members', 'nom prenom email')
            .exec();
        if (!project) {
            throw new common_1.NotFoundException('Projet non trouvé');
        }
        if (userRole !== role_enum_1.Role.ADMIN) {
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            const isManager = project.managerId._id.equals(userObjectId);
            const isMember = project.members.some(m => m._id.equals(userObjectId));
            if (!isManager && !isMember) {
                throw new common_1.ForbiddenException('Accès non autorisé à ce projet');
            }
        }
        return project;
    }
    async update(id, updateDto, userId, userRole) {
        const project = await this.findOne(id, userId, userRole);
        if (userRole !== role_enum_1.Role.ADMIN) {
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            if (!project.managerId._id.equals(userObjectId)) {
                throw new common_1.ForbiddenException('Seul le chef de projet peut modifier ce projet');
            }
        }
        Object.assign(project, updateDto);
        if (updateDto.members) {
            project.members = updateDto.members.map(m => new mongoose_2.Types.ObjectId(m));
        }
        return project.save();
    }
    async remove(id) {
        const result = await this.projectModel.findByIdAndDelete(id);
        if (!result) {
            throw new common_1.NotFoundException('Projet non trouvé');
        }
    }
    async close(projectId, userId, userRole) {
        const project = await this.findOne(projectId, userId, userRole);
        if (userRole !== role_enum_1.Role.ADMIN) {
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            if (!project.managerId._id.equals(userObjectId)) {
                throw new common_1.ForbiddenException('Seul le chef de projet ou un administrateur peut clôturer ce projet');
            }
        }
        if (project.status === document_enum_1.ProjectStatus.COMPLETED) {
            return project;
        }
        const taskModel = this.projectModel.db.model('Task');
        await taskModel.updateMany({ projectId: new mongoose_2.Types.ObjectId(projectId) }, { $set: { status: 'DONE' } });
        project.status = document_enum_1.ProjectStatus.COMPLETED;
        project.progress = 100;
        await project.save();
        return this.findOne(projectId, userId, userRole);
    }
    async updateProgress(id) {
        const taskModel = this.projectModel.db.model('Task');
        const tasks = await taskModel.find({ projectId: new mongoose_2.Types.ObjectId(id) });
        if (tasks.length === 0) {
            await this.projectModel.findByIdAndUpdate(id, { progress: 0 });
            return;
        }
        const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
        const progress = Math.round((completedTasks / tasks.length) * 100);
        await this.projectModel.findByIdAndUpdate(id, { progress });
    }
    async getHistory(projectId, userId, userRole) {
        const project = await this.findOne(projectId, userId, userRole);
        const items = [];
        items.push({
            type: 'project_created',
            date: project.createdAt?.toISOString?.() ?? new Date().toISOString(),
            label: 'Projet créé',
            metadata: { userName: project.managerId?.prenom ? `${project.managerId.prenom} ${project.managerId.nom}` : undefined },
        });
        const documents = await this.documentsService.findAll({ projectId }, userId, userRole);
        for (const doc of documents) {
            const uploadedBy = doc.uploadedBy;
            const userName = uploadedBy?.prenom ? `${uploadedBy.prenom} ${uploadedBy.nom}` : undefined;
            items.push({
                type: 'document_added',
                date: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
                label: `Document ajouté : ${doc.name}`,
                metadata: {
                    documentId: doc._id.toString(),
                    documentName: doc.name,
                    userName,
                },
            });
        }
        const tasks = await this.tasksService.findAll({ projectId });
        for (const task of tasks) {
            items.push({
                type: 'task_created',
                date: task.createdAt?.toISOString?.() ?? new Date().toISOString(),
                label: `Tâche créée : ${task.title}`,
                metadata: {
                    taskId: task._id.toString(),
                    taskTitle: task.title,
                    taskStatus: task.status,
                },
            });
        }
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return items.slice(0, 50);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => tasks_service_1.TasksService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        documents_service_1.DocumentsService,
        tasks_service_1.TasksService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map