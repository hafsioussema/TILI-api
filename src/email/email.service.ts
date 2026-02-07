import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Envoie un email de bienvenue avec les identifiants
   */
  async sendWelcomeEmail(
    to: string,
    name: string,
    temporaryPassword: string,
  ): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'TILI App <noreply@tili.com>');

    const mailOptions = {
      from,
      to,
      subject: 'Bienvenue sur TILI - Vos identifiants de connexion',
      html: this.getWelcomeEmailTemplate(name, to, temporaryPassword),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de bienvenue envoyé à: ${to}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
      // On ne lance pas l'erreur pour ne pas bloquer la création de l'utilisateur
      // L'admin peut renvoyer le mot de passe manuellement si nécessaire
    }
  }

  /**
   * Envoie une confirmation de changement de mot de passe
   */
  async sendPasswordChangedEmail(to: string, name: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'TILI App <noreply@tili.com>');

    const mailOptions = {
      from,
      to,
      subject: 'TILI - Confirmation de changement de mot de passe',
      html: this.getPasswordChangedTemplate(name),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de confirmation envoyé à: ${to}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
    }
  }

  /**
   * Envoie un email générique (pour les notifications de réunions, etc.)
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'TILI App <noreply@tili.com>');

    const mailOptions = {
      from,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email envoyé à: ${to} - Sujet: ${subject}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
    }
  }

  /**
   * Template email de bienvenue
   */
  private getWelcomeEmailTemplate(
    name: string,
    email: string,
    temporaryPassword: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .credentials p { margin: 10px 0; }
    .credentials strong { color: #667eea; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bienvenue sur TILI</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Votre compte a été créé avec succès. Voici vos identifiants de connexion :</p>
      
      <div class="credentials">
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Mot de passe temporaire :</strong> ${temporaryPassword}</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important :</strong> Pour des raisons de sécurité, vous devrez changer votre mot de passe lors de votre première connexion.
      </div>
      
      <p>Cordialement,<br>L'équipe TILI</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Template email de confirmation de changement de mot de passe
   */
  private getPasswordChangedTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info { background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Mot de passe modifié</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${name}</strong>,</p>
      
      <div class="info">
        <p>Votre mot de passe a été modifié avec succès.</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Attention :</strong> Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement votre administrateur.
      </div>
      
      <p>Cordialement,<br>L'équipe TILI</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Envoie une notification d'annulation de réunion
   */
  async sendMeetingCancellationEmail(
    participants: string[],
    meetingTitle: string,
    meetingDate: Date,
  ): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'TILI App <noreply@tili.com>');

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(meetingDate);

    for (const participant of participants) {
      const mailOptions = {
        from,
        to: participant,
        subject: `🚫 Réunion Annulée: ${meetingTitle}`,
        html: this.getMeetingCancellationTemplate(meetingTitle, formattedDate),
      };

      try {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email d'annulation envoyé à: ${participant}`);
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email d'annulation à ${participant}:`, error);
      }
    }
  }

  /**
   * Envoie une notification de modification de réunion
   */
  async sendMeetingUpdatedEmail(
    participants: string[],
    meetingTitle: string,
    meetingDate: Date,
    changes: { title?: string; date?: Date; participantsAdded?: string[]; participantsRemoved?: string[] },
  ): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'TILI App <noreply@tili.com>');

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(meetingDate);

    for (const participant of participants) {
      const mailOptions = {
        from,
        to: participant,
        subject: `📝 Réunion Modifiée: ${meetingTitle}`,
        html: this.getMeetingUpdatedTemplate(meetingTitle, formattedDate, changes),
      };

      try {
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email de modification envoyé à: ${participant}`);
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email de modification à ${participant}:`, error);
      }
    }
  }

  /**
   * Template HTML pour la modification de réunion
   */
  private getMeetingUpdatedTemplate(
    meetingTitle: string,
    formattedDate: string,
    changes: { title?: string; date?: Date; participantsAdded?: string[]; participantsRemoved?: string[] },
  ): string {
    let changeDetails = '';
    if (changes.title) changeDetails += `<li><strong>Nouveau titre :</strong> ${changes.title}</li>`;
    if (changes.date) {
      const newFormattedDate = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(changes.date);
      changeDetails += `<li><strong>Nouvelle date :</strong> ${newFormattedDate}</li>`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .meeting-info { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .meeting-info h3 { margin: 0 0 10px 0; color: #1e40af; }
    .meeting-info p { margin: 5px 0; color: #1e3a8a; }
    .changes { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 20px; }
    .changes ul { margin: 10px 0; padding-left: 20px; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📝 Réunion Modifiée</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      
      <p>Nous vous informons que la réunion suivante a été <strong>mise à jour</strong> par l'organisateur :</p>
      
      <div class="meeting-info">
        <h3>📋 ${meetingTitle}</h3>
        <p><strong>📅 Date :</strong> ${formattedDate}</p>
      </div>

      ${changeDetails ? `
      <div class="changes">
        <p><strong>Modifications apportées :</strong></p>
        <ul>
          ${changeDetails}
        </ul>
      </div>` : ''}
      
      <p>Veuillez mettre à jour votre agenda en conséquence.</p>
      
      <p>Cordialement,<br>L'équipe TILI</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Template HTML pour l'annulation de réunion
   */
  private getMeetingCancellationTemplate(
    meetingTitle: string,
    formattedDate: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .meeting-info { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .meeting-info h3 { margin: 0 0 10px 0; color: #991b1b; }
    .meeting-info p { margin: 5px 0; color: #7f1d1d; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚫 Réunion Annulée</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      
      <p>Nous vous informons que la réunion suivante a été <strong>annulée</strong> par l'organisateur :</p>
      
      <div class="meeting-info">
        <h3>📋 ${meetingTitle}</h3>
        <p><strong>📅 Date prévue :</strong> ${formattedDate}</p>
        <p><strong>❌ Statut :</strong> Annulée</p>
      </div>
      
      <p>Vous n'avez aucune action à effectuer. Cette réunion a été retirée de votre calendrier.</p>
      
      <p>Pour toute question, veuillez contacter l'organisateur de la réunion.</p>
      
      <p>Cordialement,<br>L'équipe TILI</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
