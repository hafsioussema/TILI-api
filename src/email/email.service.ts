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
}
