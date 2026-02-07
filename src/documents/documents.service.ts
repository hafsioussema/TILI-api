import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TiliDocument, TiliDocumentDoc } from './schemas/document.schema';
import { DocumentHistory, DocumentHistoryDoc } from './schemas/document-history.schema';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentsDto } from './dto/document.dto';
import { DocumentAction } from '../common/enums/document.enum';
import { Role } from '../common/enums/role.enum';
import { Project, ProjectDoc } from '../projects/schemas/project.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectModel(TiliDocument.name) private documentModel: Model<TiliDocumentDoc>,
        @InjectModel(DocumentHistory.name) private historyModel: Model<DocumentHistoryDoc>,
        @InjectModel(Project.name) private projectModel: Model<ProjectDoc>,
    ) { }

    /**
     * Upload a new document
     */
    async create(
        createDto: CreateDocumentDto,
        file: Express.Multer.File,
        userId: string,
        userRole: Role,
    ): Promise<TiliDocumentDoc> {
        // Check project access
        await this.checkProjectAccess(createDto.projectId, userId, userRole);

        const document = new this.documentModel({
            name: createDto.name || file.originalname,
            type: createDto.type,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
            version: 1,
            projectId: new Types.ObjectId(createDto.projectId),
            uploadedBy: new Types.ObjectId(userId),
            description: createDto.description,
        });

        const saved = await document.save();

        // Log history
        await this.logHistory(saved._id, DocumentAction.UPLOAD, userId, 1);

        return saved;
    }

    /**
     * Find all documents with filters
     */
    async findAll(query: QueryDocumentsDto, userId: string, userRole: Role): Promise<TiliDocumentDoc[]> {
        const filter: any = { isDeleted: false };

        if (query.type) {
            filter.type = query.type;
        }

        if (query.projectId) {
            filter.projectId = new Types.ObjectId(query.projectId);
        }

        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }

        // If consultant, only show documents from assigned projects
        if (userRole === Role.CONSULTANT) {
            const accessibleProjects = await this.projectModel.find({
                $or: [{ managerId: new Types.ObjectId(userId) }, { members: new Types.ObjectId(userId) }],
            }).select('_id');
            filter.projectId = { $in: accessibleProjects.map(p => p._id) };
        }

        return this.documentModel
            .find(filter)
            .populate('uploadedBy', 'nom prenom email')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find one document by ID
     */
    async findOne(id: string, userId: string, userRole: Role): Promise<TiliDocumentDoc> {
        const document = await this.documentModel
            .findOne({ _id: id, isDeleted: false })
            .populate('uploadedBy', 'nom prenom email')
            .populate('projectId', 'name')
            .exec();

        if (!document) {
            throw new NotFoundException('Document non trouvé');
        }

        // Check access for consultants (projectId may be populated → object with _id, or raw ObjectId)
        if (userRole === Role.CONSULTANT) {
            const projectIdRaw = document.projectId as any;
            const projectIdStr =
                (projectIdRaw && typeof projectIdRaw === 'object' && projectIdRaw._id != null)
                    ? projectIdRaw._id.toString()
                    : (projectIdRaw != null ? String(projectIdRaw) : '');
            await this.checkProjectAccess(projectIdStr, userId, userRole);
        }

        return document;
    }

    /**
     * Download a document (returns file path)
     */
    async download(id: string, userId: string, userRole: Role): Promise<{ path: string; name: string; mimeType: string }> {
        const document = await this.findOne(id, userId, userRole);

        // Log download action
        await this.logHistory(document._id, DocumentAction.DOWNLOAD, userId, document.version);

        return {
            path: document.path,
            name: document.name,
            mimeType: document.mimeType,
        };
    }

    /**
     * Update document (new version)
     */
    async update(
        id: string,
        updateDto: UpdateDocumentDto,
        file: Express.Multer.File | undefined,
        userId: string,
        userRole: Role,
    ): Promise<TiliDocumentDoc> {
        const document = await this.documentModel.findOne({ _id: id, isDeleted: false });

        if (!document) {
            throw new NotFoundException('Document non trouvé');
        }

        await this.checkProjectAccess(document.projectId.toString(), userId, userRole);

        // If new file, update version
        if (file) {
            // Delete old file
            if (fs.existsSync(document.path)) {
                fs.unlinkSync(document.path);
            }

            document.path = file.path;
            document.mimeType = file.mimetype;
            document.size = file.size;
            document.version += 1;
        }

        if (updateDto.name) document.name = updateDto.name;
        if (updateDto.type) document.type = updateDto.type;
        if (updateDto.description) document.description = updateDto.description;

        const updated = await document.save();

        await this.logHistory(updated._id, DocumentAction.UPDATE, userId, updated.version);

        return updated;
    }

    /**
     * Soft delete document
     */
    async remove(id: string, userId: string, userRole: Role): Promise<void> {
        const document = await this.documentModel.findById(id);

        if (!document) {
            throw new NotFoundException('Document non trouvé');
        }

        await this.checkProjectAccess(document.projectId.toString(), userId, userRole);

        document.isDeleted = true;
        await document.save();

        await this.logHistory(document._id, DocumentAction.DELETE, userId, document.version);
    }

    /**
     * Get document history
     */
    async getHistory(id: string, userId: string, userRole: Role): Promise<DocumentHistoryDoc[]> {
        // Verify access
        await this.findOne(id, userId, userRole);

        return this.historyModel
            .find({ documentId: new Types.ObjectId(id) })
            .populate('userId', 'nom prenom email')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Log document action to history
     */
    private async logHistory(
        documentId: Types.ObjectId,
        action: DocumentAction,
        userId: string,
        version: number,
        metadata?: Record<string, any>,
    ): Promise<void> {
        await this.historyModel.create({
            documentId,
            action,
            userId: new Types.ObjectId(userId),
            version,
            metadata,
        });
    }

    /**
     * Check if user has access to project
     */
    /**
     * Check if user has access to project
     */
    private async checkProjectAccess(projectId: string, userId: string, userRole: Role): Promise<void> {
        const project = await this.projectModel.findById(projectId);

        if (!project) {
            throw new NotFoundException('Projet non trouvé');
        }

        // Admin has access to everything
        if (userRole === Role.ADMIN) return;

        const userObjectId = new Types.ObjectId(userId);

        // Check if user is manager or member
        const isManager = project.managerId.equals(userObjectId);
        const isMember = project.members.some(m => m.equals(userObjectId));

        if (!isManager && !isMember) {
            throw new ForbiddenException('Accès non autorisé à ce projet');
        }
    }
}
