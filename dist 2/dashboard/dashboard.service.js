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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const document_schema_1 = require("../documents/schemas/document.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const document_history_schema_1 = require("../documents/schemas/document-history.schema");
const document_enum_1 = require("../common/enums/document.enum");
const role_enum_1 = require("../common/enums/role.enum");
let DashboardService = class DashboardService {
    documentModel;
    projectModel;
    historyModel;
    constructor(documentModel, projectModel, historyModel) {
        this.documentModel = documentModel;
        this.projectModel = projectModel;
        this.historyModel = historyModel;
    }
    async getStats(userId, userRole) {
        const projectFilter = {};
        const documentFilter = { isDeleted: false };
        if (userRole !== role_enum_1.Role.ADMIN) {
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            projectFilter.$or = [
                { managerId: userObjectId },
                { members: userObjectId },
            ];
            const accessibleProjects = await this.projectModel.find(projectFilter).select('_id');
            documentFilter.projectId = { $in: accessibleProjects.map(p => p._id) };
        }
        const activeProjects = await this.projectModel.countDocuments({ ...projectFilter, status: document_enum_1.ProjectStatus.ACTIVE });
        const closedProjects = await this.projectModel.countDocuments({ ...projectFilter, status: document_enum_1.ProjectStatus.COMPLETED });
        const archivedProjects = await this.projectModel.countDocuments({ ...projectFilter, status: document_enum_1.ProjectStatus.ARCHIVED });
        const docCounts = await this.documentModel.aggregate([
            { $match: documentFilter },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        const countsByType = Object.values(document_enum_1.DocumentType).reduce((acc, type) => {
            const found = docCounts.find(d => d._id === type);
            acc[type] = found ? found.count : 0;
            return acc;
        }, {});
        return {
            projects: {
                active: activeProjects,
                closed: closedProjects,
                archived: archivedProjects,
                total: activeProjects + closedProjects + archivedProjects
            },
            documents: {
                byType: countsByType,
                total: Object.values(countsByType).reduce((a, b) => a + b, 0)
            }
        };
    }
    async getGlobalActivity(userId, userRole, limit = 10) {
        let documentFilter = {};
        if (userRole !== role_enum_1.Role.ADMIN) {
            const userObjectId = new mongoose_2.Types.ObjectId(userId);
            const accessibleProjects = await this.projectModel.find({
                $or: [{ managerId: userObjectId }, { members: userObjectId }]
            }).select('_id');
            const docs = await this.documentModel.find({
                projectId: { $in: accessibleProjects.map(p => p._id) }
            }).select('_id');
            documentFilter.documentId = { $in: docs.map(d => d._id) };
        }
        return this.historyModel
            .find(documentFilter)
            .populate('userId', 'nom prenom email')
            .populate({
            path: 'documentId',
            select: 'name type projectId',
            populate: { path: 'projectId', select: 'name' }
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(document_schema_1.TiliDocument.name)),
    __param(1, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(2, (0, mongoose_1.InjectModel)(document_history_schema_1.DocumentHistory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map