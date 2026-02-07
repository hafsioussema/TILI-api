import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Meeting, Prisma } from '@prisma/client';
import { TranscriptionService } from '../transcription/transcription.service';
import { AiSummaryService } from '../ai-summary/ai-summary.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as fs from 'fs';

@Injectable()
export class MeetingsService {
    private readonly logger = new Logger(MeetingsService.name);

    constructor(
        private prisma: PrismaService,
        private transcriptionService: TranscriptionService,
        private aiSummaryService: AiSummaryService,
        private emailService: EmailService,
        private notificationsService: NotificationsService,
    ) { }

    async createMetadata(data: { title: string; date: Date; participants: string[]; minPresenceDuration?: number }): Promise<Meeting> {
        const meeting = await this.prisma.meeting.create({
            data: {
                title: data.title,
                date: data.date,
                participants: JSON.stringify(data.participants),
                status: 'SCHEDULED',
                minPresenceDuration: data.minPresenceDuration || 0,
            },
        });

        // Notify participants in-app
        if (data.participants && data.participants.length > 0) {
            for (const email of data.participants) {
                await this.notificationsService.create({
                    userEmail: email,
                    type: 'INVITATION',
                    title: 'Nouvelle Invitation',
                    message: `Vous êtes invité à la réunion : ${data.title}`,
                    link: `/meetings/${meeting.id}`
                });
            }
        }

        return meeting;
    }

    async uploadAudio(meetingId: string, file: Express.Multer.File, isLive: boolean = false): Promise<Meeting> {
        const meeting = await this.prisma.meeting.update({
            where: { id: meetingId },
            data: {
                audioUrl: file.path,
                status: 'PROCESSING',
            },
        });

        // Async processing
        this.processMeeting(meetingId, file.path, isLive);

        return meeting;
    }

    // Kept for backward compatibility if needed, or remove
    async create(file: Express.Multer.File): Promise<Meeting> {
        // Legacy 'direct upload' creates a meeting wrapper
        return this.createMetadata({
            title: file.originalname,
            date: new Date(),
            participants: []
        }).then(m => this.uploadAudio(m.id, file));
    }

    private async processMeeting(meetingId: string, filePath: string, isLive: boolean = false) {
        this.logger.log(`Processing meeting ${meetingId}...`);
        try {
            // 3. Transcribe
            const { text, segments } = await this.transcriptionService.transcribe(filePath);

            const isContentEmpty = !text || text.trim().length < 10; // Simple check for "empty" content

            // For live meetings, append to existing transcript; for imports, create/replace
            if (isLive) {
                // Check if transcript already exists
                const existingTranscript = await this.prisma.transcript.findUnique({
                    where: { meetingId }
                });

                if (existingTranscript) {
                    // Append new content
                    const newContent = isContentEmpty
                        ? "\n\n[Segment vide - aucun contenu audio détecté]"
                        : `\n\n--- Nouveau segment ---\n${text}`;

                    await this.prisma.transcript.update({
                        where: { meetingId },
                        data: {
                            content: existingTranscript.content + newContent,
                            segments: JSON.stringify([
                                ...JSON.parse(existingTranscript.segments || '[]'),
                                ...segments
                            ]),
                        },
                    });
                } else {
                    // First recording - create new
                    await this.prisma.transcript.create({
                        data: {
                            meetingId,
                            content: isContentEmpty ? "Aucun contenu audio détecté." : text,
                            segments: JSON.stringify(segments),
                        },
                    });
                }
            } else {
                // Import mode - upsert (replace if exists)
                await this.prisma.transcript.upsert({
                    where: { meetingId },
                    create: {
                        meetingId,
                        content: isContentEmpty ? "Aucun contenu audio détecté." : text,
                        segments: JSON.stringify(segments),
                    },
                    update: {
                        content: isContentEmpty ? "Aucun contenu audio détecté." : text,
                        segments: JSON.stringify(segments),
                    },
                });
            }

            // 4. Summarize
            let summaryContent = "Aucun résumé disponible car l'enregistrement est trop court ou vide.";
            if (!isContentEmpty) {
                summaryContent = await this.aiSummaryService.generateSummary(text);
            }

            if (isLive) {
                // For live meetings, append to existing summary
                const existingSummary = await this.prisma.summary.findUnique({
                    where: { meetingId }
                });

                if (existingSummary) {
                    const newSummaryContent = isContentEmpty
                        ? "\n\n[Segment vide]"
                        : `\n\n--- Nouveau segment ---\n${summaryContent}`;

                    await this.prisma.summary.update({
                        where: { meetingId },
                        data: {
                            content: existingSummary.content + newSummaryContent,
                        },
                    });
                } else {
                    await this.prisma.summary.create({
                        data: {
                            meetingId,
                            content: summaryContent,
                        },
                    });
                }
            } else {
                // Import mode - upsert
                await this.prisma.summary.upsert({
                    where: { meetingId },
                    create: {
                        meetingId,
                        content: summaryContent,
                    },
                    update: {
                        content: summaryContent,
                    },
                });
            }

            // 5. Extract Actions
            if (!isContentEmpty) {
                const actions = await this.aiSummaryService.extractActions(text);
                if (actions.length > 0) {
                    await this.prisma.actionItem.createMany({
                        data: actions.map(action => ({
                            meetingId,
                            description: action.description,
                            assignee: action.assignee,
                            priority: action.priority || 'MEDIUM',
                            // Simple date parsing or null
                            dueDate: action.dueDate ? new Date(action.dueDate) : null,
                        })),
                    });
                }
            }

            // 6. Simulate Attendance and Completion ONLY if NOT Live (Import Mode)
            if (!isLive) {
                // Retrieve the meeting to get participants and minPresence
                const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
                let attendanceData = {};

                if (meeting) {
                    const participants = JSON.parse(meeting.participants || '[]');
                    const minDuration = meeting.minPresenceDuration || 0;

                    // Estimate duration from transcription segments if available
                    let estimatedDuration = 0;
                    if (segments && segments.length > 0) {
                        // Check if segments have 'end' or 'end_timestamp'
                        const lastSegment = segments[segments.length - 1];
                        // OpenAI verbose_json usually has 'end'
                        if (lastSegment && typeof lastSegment === 'object' && 'end' in lastSegment) {
                            estimatedDuration = Math.ceil(Number(lastSegment['end']));
                        }
                    }

                    // Fallback to file size approx (1 min per MB for video/audio mix is rough but better than nothing or random 30m)
                    if (estimatedDuration === 0) {
                        try {
                            const stats = fs.statSync(filePath);
                            // Very rough: 1MB ~ 10s for high quality video? No, let's assume audio upload mainly or use very rough.
                            estimatedDuration = Math.max(10, Math.floor(stats.size / 50000));
                        } catch (e) {
                            estimatedDuration = 60; // Default 1 min
                        }
                    }

                    attendanceData = participants.reduce((acc, email) => {
                        // Start with 0 duration (Absent) for realism in single-player demo
                        let presence = 0;

                        // For demo purposes, we randomly assign status:
                        // 60% chance: Fully Present (duration = meeting duration)
                        // 20% chance: Partially Present (random duration < meeting duration)
                        // 20% chance: Absent (0s)
                        const rand = Math.random();
                        if (rand > 0.4) {
                            presence = estimatedDuration;
                        } else if (rand > 0.2) {
                            presence = Math.floor(estimatedDuration * Math.random());
                        } else {
                            presence = 0;
                        }

                        // Strict sanity check: cannot stay longer than meeting
                        if (presence > estimatedDuration) presence = estimatedDuration;

                        let status = 'INFO';
                        if (estimatedDuration >= minDuration) {
                            status = presence >= minDuration ? 'PRESENT' : 'ABSENT';
                        } else {
                            status = 'N/A'; // Duration too short to count
                        }

                        // Special case: if presence is 0, always ABSENT unless N/A
                        if (presence === 0 && status !== 'N/A') status = 'ABSENT';

                        acc[email] = {
                            duration: presence,
                            status: status,
                            meetingDuration: estimatedDuration
                        };
                        return acc;
                    }, {});
                }

                // 7. Complete and Save Attendance
                await this.prisma.meeting.update({
                    where: { id: meetingId },
                    data: {
                        status: 'COMPLETED',
                        attendance: JSON.stringify(attendanceData)
                    },
                });
            }

            this.logger.log(`Meeting ${meetingId} processing completed.`);

        } catch (error) {
            this.logger.error(`Processing failed for meeting ${meetingId}`, error);
            await this.prisma.meeting.update({
                where: { id: meetingId },
                data: { status: 'FAILED' },
            });
        }
    }

    async findAll(): Promise<Meeting[]> {
        return this.prisma.meeting.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                summary: true, // simplified view
            },
        });
    }

    async findAllByUser(email: string): Promise<Meeting[]> {
        const all = await this.findAll();
        return all.filter(m => {
            try {
                const parts = JSON.parse(m.participants || '[]');
                return Array.isArray(parts) && parts.includes(email);
            } catch { return false; }
        });
    }

    async findOne(id: string): Promise<Meeting | null> {
        return this.prisma.meeting.findUnique({
            where: { id },
            include: {
                transcript: true,
                summary: true,
                actions: true,
            },
        });
    }
    async update(id: string, data: { title?: string; date?: string; participants?: string[]; minPresenceDuration?: number; status?: string; attendance?: string }): Promise<Meeting> {
        const meeting = await this.prisma.meeting.findUnique({ where: { id } });
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const oldParticipants = JSON.parse(meeting.participants || '[]') as string[];
        const newParticipants = data.participants || oldParticipants;

        const updateData: Prisma.MeetingUpdateInput = {};
        if (data.title) updateData.title = data.title;
        if (data.date) updateData.date = new Date(data.date);
        if (data.participants) updateData.participants = JSON.stringify(data.participants);
        if (data.minPresenceDuration !== undefined) updateData.minPresenceDuration = data.minPresenceDuration;
        if (data.status) updateData.status = data.status as any;
        if (data.attendance) updateData.attendance = data.attendance;

        const updatedMeeting = await this.prisma.meeting.update({
            where: { id },
            data: updateData,
        });

        // Notify participants if it's a scheduled meeting
        if (meeting.status === 'SCHEDULED') {
            const changes: any = {};
            if (data.title && data.title !== meeting.title) changes.title = data.title;
            if (data.date && new Date(data.date).getTime() !== new Date(meeting.date).getTime()) {
                changes.date = new Date(data.date);
            }

            // Detect new participants to send invitations, and notify existing ones of changes
            const addedParticipants = newParticipants.filter(p => !oldParticipants.includes(p));
            // const removedParticipants = oldParticipants.filter(p => !newParticipants.includes(p));

            if (Object.keys(changes).length > 0) {
                // Notify all current participants about general changes
                await this.emailService.sendMeetingUpdatedEmail(
                    newParticipants,
                    updatedMeeting.title,
                    updatedMeeting.date,
                    changes
                );

                for (const email of newParticipants) {
                    await this.notificationsService.create({
                        userEmail: email,
                        type: 'UPDATE',
                        title: 'Réunion Mise à jour',
                        message: `La réunion "${updatedMeeting.title}" a été modifiée.`,
                        link: `/meetings/${updatedMeeting.id}`
                    });
                }
            } else if (addedParticipants.length > 0) {
                // If only participants were added, send them the standard invitation
                // (Ideally we'd use schedulerService here, but since it's a simple update, we can just send standard info)
                await this.emailService.sendMeetingUpdatedEmail(
                    addedParticipants,
                    updatedMeeting.title,
                    updatedMeeting.date,
                    { title: updatedMeeting.title } // Just to trigger a "you are invited" type email
                );

                for (const email of addedParticipants) {
                    await this.notificationsService.create({
                        userEmail: email,
                        type: 'INVITATION',
                        title: 'Nouvelle Invitation',
                        message: `Vous êtes invité à la réunion : ${updatedMeeting.title}`,
                        link: `/meetings/${updatedMeeting.id}`
                    });
                }
            }
        }

        return updatedMeeting;
    }

    async remove(id: string): Promise<void> {
        const meeting = await this.prisma.meeting.findUnique({ where: { id } });

        if (!meeting) {
            return;
        }

        // Send cancellation emails if it's a scheduled meeting
        if (meeting.status === 'SCHEDULED' && meeting.participants) {
            try {
                const participants = JSON.parse(meeting.participants) as string[];
                await this.emailService.sendMeetingCancellationEmail(
                    participants,
                    meeting.title,
                    meeting.date,
                );
                this.logger.log(`Emails d'annulation envoyés pour la réunion: ${meeting.title}`);
            } catch (error) {
                this.logger.error(`Erreur lors de l'envoi des emails d'annulation:`, error);
            }

            // In-app Notification for cancellation
            try {
                const participants = JSON.parse(meeting.participants) as string[];
                for (const email of participants) {
                    await this.notificationsService.create({
                        userEmail: email,
                        type: 'CANCELLATION',
                        title: 'Réunion Annulée',
                        message: `La réunion "${meeting.title}" a été annulée.`,
                    });
                }
            } catch (e) {
                this.logger.error(`Erreur lors de la création des notifications d'annulation:`, e);
            }
        }

        // Delete audio file if exists
        if (meeting.audioUrl) {
            try {
                fs.unlinkSync(meeting.audioUrl);
            } catch (err) {
                this.logger.error(`Failed to delete file ${meeting.audioUrl}`, err);
            }
        }

        await this.prisma.meeting.delete({ where: { id } });
    }

    // ============== Document Association Methods ==============

    async addDocument(meetingId: string, documentId: string): Promise<Meeting> {
        const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const currentDocIds: string[] = JSON.parse(meeting.documentIds || '[]');
        
        // Avoid duplicates
        if (!currentDocIds.includes(documentId)) {
            currentDocIds.push(documentId);
        }

        return this.prisma.meeting.update({
            where: { id: meetingId },
            data: { documentIds: JSON.stringify(currentDocIds) },
        });
    }

    async removeDocument(meetingId: string, documentId: string): Promise<Meeting> {
        const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const currentDocIds: string[] = JSON.parse(meeting.documentIds || '[]');
        const updatedDocIds = currentDocIds.filter(id => id !== documentId);

        return this.prisma.meeting.update({
            where: { id: meetingId },
            data: { documentIds: JSON.stringify(updatedDocIds) },
        });
    }

    async getDocuments(meetingId: string): Promise<string[]> {
        const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
        if (!meeting) {
            return [];
        }

        return JSON.parse(meeting.documentIds || '[]');
    }
}
