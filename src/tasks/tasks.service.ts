import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDoc } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './dto/task.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<TaskDoc>,
        private projectsService: ProjectsService,
    ) { }

    async create(createDto: CreateTaskDto): Promise<TaskDoc> {
        const task = new this.taskModel({
            ...createDto,
            projectId: new Types.ObjectId(createDto.projectId),
            assigneeId: createDto.assigneeId ? new Types.ObjectId(createDto.assigneeId) : undefined,
        });
        const savedTask = await task.save();
        await this.projectsService.updateProgress(createDto.projectId);
        return savedTask;
    }

    async findAll(query: QueryTasksDto): Promise<TaskDoc[]> {
        const filter: any = {};
        if (query.projectId) filter.projectId = new Types.ObjectId(query.projectId);
        if (query.status) filter.status = query.status;
        if (query.assigneeId) filter.assigneeId = new Types.ObjectId(query.assigneeId);

        return this.taskModel
            .find(filter)
            .populate('assigneeId', 'nom prenom email')
            .sort({ order: 1, createdAt: -1 })
            .exec();
    }

    async findOne(id: string): Promise<TaskDoc> {
        const task = await this.taskModel.findById(id).populate('assigneeId', 'nom prenom email').exec();
        if (!task) throw new NotFoundException('Tâche non trouvée');
        return task;
    }

    async update(id: string, updateDto: UpdateTaskDto): Promise<TaskDoc> {
        const updateData: any = { ...updateDto };
        if (updateData.assigneeId) updateData.assigneeId = new Types.ObjectId(updateData.assigneeId);

        const task = await this.taskModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('assigneeId', 'nom prenom email').exec();

        if (!task) throw new NotFoundException('Tâche non trouvée');

        // Update project progress
        await this.projectsService.updateProgress(task.projectId.toString());

        return task;
    }

    async remove(id: string): Promise<void> {
        const task = await this.taskModel.findById(id).exec();
        if (!task) throw new NotFoundException('Tâche non trouvée');

        const projectId = task.projectId.toString();
        await this.taskModel.findByIdAndDelete(id).exec();

        // Update project progress
        await this.projectsService.updateProgress(projectId);
    }
}
