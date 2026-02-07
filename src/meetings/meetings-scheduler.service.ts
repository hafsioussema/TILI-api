import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MeetingsService } from './meetings.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MeetingsSchedulerService {
    private readonly logger = new Logger(MeetingsSchedulerService.name);

    constructor(
        private readonly meetingsService: MeetingsService,
        private readonly emailService: EmailService,
        private readonly notificationsService: NotificationsService,
    ) { }

    /**
     * Vérifie toutes les 10 minutes s'il y a des réunions qui commencent dans 1 heure
     * et envoie des rappels aux participants
     */
    @Cron('*/10 * * * *') // Toutes les 10 minutes
    async checkUpcomingMeetings() {
        this.logger.log('Vérification des réunions à venir...');

        try {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            const oneHourTenMinutesLater = new Date(now.getTime() + 70 * 60 * 1000);

            // Récupérer toutes les réunions planifiées
            const allMeetings = await this.meetingsService.findAll();

            // Filtrer les réunions qui commencent dans environ 1 heure
            const upcomingMeetings = allMeetings.filter(meeting => {
                if (meeting.status !== 'SCHEDULED') return false;

                const meetingDate = new Date(meeting.date);
                return meetingDate >= oneHourLater && meetingDate <= oneHourTenMinutesLater;
            });

            this.logger.log(`${upcomingMeetings.length} réunion(s) commence(nt) dans 1 heure`);

            // Envoyer les rappels
            for (const meeting of upcomingMeetings) {
                await this.sendMeetingReminder(meeting);
            }
        } catch (error) {
            this.logger.error('Erreur lors de la vérification des réunions:', error);
        }
    }

    /**
     * Envoie un rappel de réunion à tous les participants
     */
    private async sendMeetingReminder(meeting: any) {
        try {
            const participants = JSON.parse(meeting.participants || '[]');
            const meetingDate = new Date(meeting.date);

            const subject = `Rappel: ${meeting.title} dans 1 heure`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">🔔 Rappel de réunion</h2>
                    <p>Bonjour,</p>
                    <p>Votre réunion <strong>${meeting.title}</strong> commence dans <strong>1 heure</strong>.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${meetingDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</p>
                        <p style="margin: 5px 0;"><strong>🕐 Heure:</strong> ${meetingDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                        <p style="margin: 5px 0;"><strong>👥 Participants:</strong> ${participants.length} personne(s)</p>
                    </div>
                    
                    <p>Préparez-vous et assurez-vous d'être disponible.</p>
                    
                    <a href="http://localhost:5175/meetings/${meeting.id}" 
                       style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                        Voir les détails
                    </a>
                    
                    <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                        Ceci est un rappel automatique de TILI Workspace.
                    </p>
                </div>
            `;

            for (const email of participants) {
                await this.emailService.sendEmail(email, subject, html);
                await this.notificationsService.create({
                    userEmail: email,
                    type: 'REMINDER',
                    title: 'Rappel de réunion',
                    message: `Votre réunion "${meeting.title}" commence dans 1 heure.`,
                    link: `/meetings/${meeting.id}`
                });
                this.logger.log(`Rappel envoyé à ${email} pour la réunion ${meeting.title}`);
            }
        } catch (error) {
            this.logger.error(`Erreur lors de l'envoi du rappel pour ${meeting.title}:`, error);
        }
    }

    /**
     * Envoie une invitation initiale lors de la création d'une réunion planifiée
     */
    async sendMeetingInvitation(meeting: any, organizerEmail: string) {
        try {
            const participants = JSON.parse(meeting.participants || '[]');
            const meetingDate = new Date(meeting.date);

            const subject = `Invitation: ${meeting.title}`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">📧 Nouvelle invitation à une réunion</h2>
                    <p>Bonjour,</p>
                    <p>Vous êtes invité(e) à participer à la réunion suivante :</p>
                    
                    <div style="background-color: #eff6ff; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1e40af;">${meeting.title}</h3>
                        <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${meetingDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</p>
                        <p style="margin: 5px 0;"><strong>🕐 Heure:</strong> ${meetingDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                        <p style="margin: 5px 0;"><strong>👤 Organisateur:</strong> ${organizerEmail}</p>
                        <p style="margin: 5px 0;"><strong>👥 Participants:</strong> ${participants.join(', ')}</p>
                    </div>
                    
                    <p>Cette réunion a été ajoutée à votre planning.</p>
                    <p><strong>⏰ Vous recevrez un rappel 1 heure avant le début de la réunion.</strong></p>
                    
                    <a href="http://localhost:5175/meetings/${meeting.id}" 
                       style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                        Voir les détails
                    </a>
                    
                    <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                        TILI Workspace - Gestion intelligente de réunions
                    </p>
                </div>
            `;

            for (const email of participants) {
                await this.emailService.sendEmail(email, subject, html);
                this.logger.log(`Invitation envoyée à ${email} pour la réunion ${meeting.title}`);
            }
        } catch (error) {
            this.logger.error(`Erreur lors de l'envoi des invitations pour ${meeting.title}:`, error);
        }
    }
}
