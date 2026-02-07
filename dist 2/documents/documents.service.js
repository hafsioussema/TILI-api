"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const document_schema_1 = require("./schemas/document.schema");
const document_history_schema_1 = require("./schemas/document-history.schema");
const document_enum_1 = require("../common/enums/document.enum");
const role_enum_1 = require("../common/enums/role.enum");
const project_schema_1 = require("../projects/schemas/project.schema");
const fs = __importStar(require("fs"));
let DocumentsService = class DocumentsService {
    documentModel;
    historyModel;
    projectModel;
    constructor(documentModel, historyModel, projectModel) {
        this.documentModel = documentModel;
        this.historyModel = historyModel;
        this.projectModel = projectModel;
    }
    async create(createDto, file, userId, userRole) {
        await this.checkProjectAccess(createDto.projectId, userId, userRole);
        const document = new this.documentModel({
            name: createDto.name || file.originalname,
            type: createDto.type,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
            version: 1,
            projectId: new mongoose_2.Types.ObjectId(createDto.projectId),
            uploadedBy: new mongoose_2.Types.ObjectId(userId),
            description: createDto.description,
        });
        const saved = await document.save();
        await this.logHistory(saved._id, document_enum_1.DocumentAction.UPLOAD, userId, 1);
        return saved;
    }
    async findAll(query, userId, userRole) {
        const filter = { isDeleted: false };
        if (query.type) {
            filter.type = query.type;
        }
        if (query.projectId) {
            filter.projectId = new mongoose_2.Types.ObjectId(query.projectId);
        }
        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }
        if (userRole === role_enum_1.Role.CONSULTANT) {
            const accessibleProjects = await this.projectModel.find({
                $or: [{ managerId: new mongoose_2.Types.ObjectId(userId) }, { members: new mongoose_2.Types.ObjectId(userId) }],
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
    async findOne(id, userId, userRole) {
        const document = await this.documentModel
            .findOne({ _id: id, isDeleted: false })
            .populate('uploadedBy', 'nom prenom email')
            .populate('projectId', 'name')
            .exec();
        if (!document) {
            throw new common_1.NotFoundException('Document non trouvé');
        }
        if (userRole === role_enum_1.Role.CONSULTANT) {
            const projectIdRaw = document.projectId;
            const projectIdStr = (projectIdRaw && typeof projectIdRaw === 'object' && projectIdRaw._id != null)
                ? projectIdRaw._id.toString()
                : (projectIdRaw != null ? String(projectIdRaw) : '');
            await this.checkProjectAccess(projectIdStr, userId, userRole);
        }
        return document;
    }
    async download(id, userId, userRole) {
        const document = await this.findOne(id, userId, userRole);
        await this.logHistory(document._id, document_enum_1.DocumentAction.DOWNLOAD, userId, document.version);
        return {
            path: document.path,
            name: document.name,
            mimeType: document.mimeType,
        };
    }
    async update(id, updateDto, file, userId, userRole) {
        const document = await this.documentModel.findOne({ _id: id, isDeleted: false });
        if (!document) {
            throw new common_1.NotFoundException('Document non trouvé');
        }
        await this.checkProjectAccess(document.projectId.toString(), userId, userRole);
        if (file) {
            if (fs.existsSync(document.path)) {
                fs.unlinkSync(document.path);
            }
            document.path = file.path;
            document.mimeType = file.mimetype;
            document.size = file.size;
            document.version += 1;
        }
        if (updateDto.name)
            document.name = updateDto.name;
        if (updateDto.type)
            document.type = updateDto.type;
        if (updateDto.description)
            document.description = updateDto.description;
        const updated = await document.save();
        await this.logHistory(updated._id, document_enum_1.DocumentAction.UPDATE, userId, updated.version);
        return updated;
    }
    async remove(id, userId, userRole) {
        const document = await this.documentModel.findById(id);
        if (!document) {
            throw new common_1.NotFoundException('Document non trouvé');
        }
        await this.checkProjectAccess(document.projectId.toString(), userId, userRole);
        document.isDeleted = true;
        await document.save();
        await this.logHistory(document._id, document_enum_1.DocumentAction.DELETE, userId, document.version);
    }
    async getHistory(id, userId, userRole) {
        await this.findOne(id, userId, userRole);
        return this.historyModel
            .find({ documentId: new mongoose_2.Types.ObjectId(id) })
            .populate('userId', 'nom prenom email')
            .sort({ createdAt: -1 })
            .exec();
    }
    async logHistory(documentId, action, userId, version, metadata) {
        await this.historyModel.create({
            documentId,
            action,
            userId: new mongoose_2.Types.ObjectId(userId),
            version,
            metadata,
        });
    }
    async checkProjectAccess(projectId, userId, userRole) {
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Projet non trouvé');
        }
        if (userRole === role_enum_1.Role.ADMIN)
            return;
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const isManager = project.managerId.equals(userObjectId);
        const isMember = project.members.some(m => m.equals(userObjectId));
        if (!isManager && !isMember) {
            throw new common_1.ForbiddenException('Accès non autorisé à ce projet');
        }
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(document_schema_1.TiliDocument.name)),
    __param(1, (0, mongoose_1.InjectModel)(document_history_schema_1.DocumentHistory.name)),
    __param(2, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map