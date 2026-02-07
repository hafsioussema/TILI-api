import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDoc = Task & Document;

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

@Schema({ timestamps: true })
export class Task {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ enum: TaskStatus, default: TaskStatus.TODO })
    status: TaskStatus;

    @Prop({ enum: TaskPriority, default: TaskPriority.MEDIUM })
    priority: TaskPriority;

    @Prop()
    dueDate: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    assigneeId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ default: 0 })
    order: number;

    @Prop([String])
    tags: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
