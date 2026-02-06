import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDoc } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto } from './dto/project.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<ProjectDoc>,
    ) { }

    async create(createDto: CreateProjectDto): Promise<ProjectDoc> {
        const project = new this.projectModel({
            ...createDto,
            managerId: new Types.ObjectId(createDto.managerId),
            members: createDto.members?.map(m => new Types.ObjectId(m)) || [],
        });
        return project.save();
    }

    async findAll(query: QueryProjectsDto, userId: string, userRole: Role): Promise<ProjectDoc[]> {
        const filter: any = {};

        if (query.status) {
            filter.status = query.status;
        }

        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }

        // Non-admin users only see their projects
        if (userRole !== Role.ADMIN) {
            const userObjectId = new Types.ObjectId(userId);
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

    async findOne(id: string, userId: string, userRole: Role): Promise<ProjectDoc> {
        const project = await this.projectModel
            .findById(id)
            .populate('managerId', 'nom prenom email')
            .populate('members', 'nom prenom email')
            .exec();

        if (!project) {
            throw new NotFoundException('Projet non trouvé');
        }

        // Check access for non-admins
        if (userRole !== Role.ADMIN) {
            const userObjectId = new Types.ObjectId(userId);
            const isManager = project.managerId._id.equals(userObjectId);
            const isMember = project.members.some(m => m._id.equals(userObjectId));

            if (!isManager && !isMember) {
                throw new ForbiddenException('Accès non autorisé à ce projet');
            }
        }

        return project;
    }

    async update(id: string, updateDto: UpdateProjectDto, userId: string, userRole: Role): Promise<ProjectDoc> {
        const project = await this.findOne(id, userId, userRole);

        // Only admin or manager can update
        if (userRole !== Role.ADMIN) {
            const userObjectId = new Types.ObjectId(userId);
            if (!project.managerId._id.equals(userObjectId)) {
                throw new ForbiddenException('Seul le chef de projet peut modifier ce projet');
            }
        }

        Object.assign(project, updateDto);
        if (updateDto.members) {
            project.members = updateDto.members.map(m => new Types.ObjectId(m)) as any;
        }

        return project.save();
    }

    async remove(id: string): Promise<void> {
        const result = await this.projectModel.findByIdAndDelete(id);
        if (!result) {
            throw new NotFoundException('Projet non trouvé');
        }
    }
}
