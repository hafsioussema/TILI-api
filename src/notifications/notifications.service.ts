import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
// @ts-ignore
import { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
    // Service to handle in-app notifications using indexed Prisma model
    constructor(private prisma: PrismaService) { }

    async create(data: {
        userEmail: string;
        type: string;
        title: string;
        message: string;
        link?: string;
    }): Promise<Notification> {
        // @ts-ignore
        return this.prisma.notification.create({
            data: {
                ...data,
                isRead: false,
            },
        });
    }

    async findAllByUser(email: string): Promise<Notification[]> {
        // @ts-ignore
        return this.prisma.notification.findMany({
            where: { userEmail: email },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async markAsRead(id: string): Promise<Notification> {
        // @ts-ignore
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead(email: string): Promise<void> {
        // @ts-ignore
        await this.prisma.notification.updateMany({
            where: { userEmail: email, isRead: false },
            data: { isRead: true },
        });
    }

    async delete(id: string): Promise<void> {
        // @ts-ignore
        await this.prisma.notification.delete({
            where: { id },
        });
    }
}
