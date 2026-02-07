import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDoc } from './schemas/project.schema';
import {
  CreateProjectDto,
  UpdateProjectDto,
  QueryProjectsDto,
} from './dto/project.dto';
import { Role } from '../common/enums/role.enum';
import { ProjectStatus } from '../common/enums/document.enum';
import { DocumentsService } from '../documents/documents.service';
import { TasksService } from '../tasks/tasks.service';

export interface ProjectHistoryItem {
  type: 'project_created' | 'document_added' | 'task_created';
  date: string;
  label: string;
  metadata?: {
    documentId?: string;
    documentName?: string;
    taskId?: string;
    taskTitle?: string;
    taskStatus?: string;
    userName?: string;
  };
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDoc>,
    private readonly documentsService: DocumentsService,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  async create(
    createDto: CreateProjectDto,
    creatorId: string,
  ): Promise<ProjectDoc> {
    const managerId = createDto.managerId || creatorId;
    const project = new this.projectModel({
      ...createDto,
      managerId: new Types.ObjectId(managerId),
      members: createDto.members?.map((m) => new Types.ObjectId(m)) || [],
    });
    const savedProject = await project.save();
    return this.findOne(savedProject._id.toString(), '', Role.ADMIN);
  }

  async findAll(
    query: QueryProjectsDto,
    userId: string,
    userRole: Role,
  ): Promise<ProjectDoc[]> {
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
      filter.$or = [{ managerId: userObjectId }, { members: userObjectId }];
    }

    return this.projectModel
      .find(filter)
      .populate('managerId', 'nom prenom email')
      .populate('members', 'nom prenom email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<ProjectDoc> {
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
      const isMember = project.members.some((m) => m._id.equals(userObjectId));

      if (!isManager && !isMember) {
        throw new ForbiddenException('Accès non autorisé à ce projet');
      }
    }

    return project;
  }

  async update(
    id: string,
    updateDto: UpdateProjectDto,
    userId: string,
    userRole: Role,
  ): Promise<ProjectDoc> {
    const project = await this.findOne(id, userId, userRole);

    // Only admin or manager can update
    if (userRole !== Role.ADMIN) {
      const userObjectId = new Types.ObjectId(userId);
      if (!project.managerId._id.equals(userObjectId)) {
        throw new ForbiddenException(
          'Seul le chef de projet peut modifier ce projet',
        );
      }
    }

    Object.assign(project, updateDto);

    if (updateDto.members) {
      project.members = updateDto.members.map(
        (m) => new Types.ObjectId(m),
      ) as any;
    }

    if (updateDto.managerId) {
      project.managerId = new Types.ObjectId(updateDto.managerId) as any;
    }

    return project.save();
  }

  async remove(id: string, userId: string, userRole: Role): Promise<void> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }
    if (userRole !== Role.ADMIN) {
      const userObjectId = new Types.ObjectId(userId);
      if (!(project.managerId as Types.ObjectId).equals(userObjectId)) {
        throw new ForbiddenException(
          'Seul le chef de projet ou un administrateur peut supprimer ce projet',
        );
      }
    }
    await this.projectModel.findByIdAndDelete(id);
  }

  /**
   * Close a project: set status to COMPLETED, mark all tasks as DONE, set progress to 100.
   * Allowed for ADMIN or CHEF_PROJET.
   */
  async close(
    projectId: string,
    userId: string,
    userRole: Role,
  ): Promise<ProjectDoc> {
    const project = await this.findOne(projectId, userId, userRole);

    if (userRole !== Role.ADMIN) {
      const userObjectId = new Types.ObjectId(userId);
      if (!(project.managerId as any)._id.equals(userObjectId)) {
        throw new ForbiddenException(
          'Seul le chef de projet ou un administrateur peut clôturer ce projet',
        );
      }
    }

    if (project.status === ProjectStatus.COMPLETED) {
      return project;
    }

    const taskModel = this.projectModel.db.model('Task');
    await taskModel.updateMany(
      { projectId: new Types.ObjectId(projectId) },
      { $set: { status: 'DONE' } },
    );

    project.status = ProjectStatus.COMPLETED;
    project.progress = 100;
    await project.save();

    return this.findOne(projectId, userId, userRole);
  }

  async updateProgress(id: string): Promise<void> {
    const taskModel = this.projectModel.db.model('Task');
    const tasks = await taskModel.find({ projectId: new Types.ObjectId(id) });

    if (tasks.length === 0) {
      await this.projectModel.findByIdAndUpdate(id, { progress: 0 });
      return;
    }

    const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    await this.projectModel.findByIdAndUpdate(id, { progress });
  }

  /**
   * Get project activity history (timeline of creation, documents, tasks)
   */
  async getHistory(
    projectId: string,
    userId: string,
    userRole: Role,
  ): Promise<ProjectHistoryItem[]> {
    const project = await this.findOne(projectId, userId, userRole);
    const items: ProjectHistoryItem[] = [];

    items.push({
      type: 'project_created',
      date:
        (project as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
      label: 'Projet créé',
      metadata: {
        userName: (project.managerId as any)?.prenom
          ? `${(project.managerId as any).prenom} ${(project.managerId as any).nom}`
          : undefined,
      },
    });

    const documents = await this.documentsService.findAll(
      { projectId },
      userId,
      userRole,
    );
    for (const doc of documents) {
      const uploadedBy = (doc as any).uploadedBy;
      const userName = uploadedBy?.prenom
        ? `${uploadedBy.prenom} ${uploadedBy.nom}`
        : undefined;
      items.push({
        type: 'document_added',
        date:
          (doc as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
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
        date:
          (task as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
        label: `Tâche créée : ${task.title}`,
        metadata: {
          taskId: task._id.toString(),
          taskTitle: task.title,
          taskStatus: (task as any).status,
        },
      });
    }

    items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return items.slice(0, 50);
  }
}
