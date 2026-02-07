import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TiliDocument, TiliDocumentDoc } from '../documents/schemas/document.schema';
import { Project, ProjectDoc } from '../projects/schemas/project.schema';
import { DocumentHistory, DocumentHistoryDoc } from '../documents/schemas/document-history.schema';
import { DocumentType, ProjectStatus } from '../common/enums/document.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(TiliDocument.name) private documentModel: Model<TiliDocumentDoc>,
        @InjectModel(Project.name) private projectModel: Model<ProjectDoc>,
        @InjectModel(DocumentHistory.name) private historyModel: Model<DocumentHistoryDoc>,
    ) { }

    async getStats(userId: string, userRole: Role) {
        const projectFilter: any = {};
        const documentFilter: any = { isDeleted: false };

        if (userRole !== Role.ADMIN) {
            const userObjectId = new Types.ObjectId(userId);
            projectFilter.$or = [
                { managerId: userObjectId },
                { members: userObjectId },
            ];

            const accessibleProjects = await this.projectModel.find(projectFilter).select('_id');
            documentFilter.projectId = { $in: accessibleProjects.map(p => p._id) };
        }

        // Project counts
        const activeProjects = await this.projectModel.countDocuments({ ...projectFilter, status: ProjectStatus.ACTIVE });
        const closedProjects = await this.projectModel.countDocuments({ ...projectFilter, status: ProjectStatus.COMPLETED });
        const archivedProjects = await this.projectModel.countDocuments({ ...projectFilter, status: ProjectStatus.ARCHIVED });

        // Document counts by type
        const docCounts = await this.documentModel.aggregate([
            { $match: documentFilter },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const countsByType = Object.values(DocumentType).reduce((acc, type) => {
            const found = docCounts.find(d => d._id === type);
            acc[type] = found ? found.count : 0;
            return acc;
        }, {} as Record<string, number>);

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

    async getGlobalActivity(userId: string, userRole: Role, limit = 10) {
        let documentFilter: any = {};

        if (userRole !== Role.ADMIN) {
            const userObjectId = new Types.ObjectId(userId);
            const accessibleProjects = await this.projectModel.find({
                $or: [{ managerId: userObjectId }, { members: userObjectId }]
            }).select('_id');

            // To filter history, we first need documents in those projects
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
}
