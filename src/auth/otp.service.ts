import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private emailService: EmailService,
  ) {}

  /**
   * Génère et envoie un code OTP pour le reset de mot de passe
   */
  async generateAndSendOtp(email: string): Promise<void> {
    // Invalider tous les OTPs existants pour cet email
    await this.otpModel.updateMany(
      { email, isUsed: false },
      { isUsed: true }
    );

    // Générer un code OTP de 6 chiffres
    const otpCode = this.generateOtpCode();

    // Créer l'OTP avec une expiration de 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const otp = new this.otpModel({
      email,
      code: otpCode,
      type: 'PASSWORD_RESET',
      expiresAt,
      isUsed: false,
      attempts: 0,
      maxAttempts: 3,
    });

    await otp.save();

    // Envoyer l'email avec le code OTP
    await this.sendOtpEmail(email, otpCode);

    this.logger.log(`OTP généré et envoyé pour: ${email}`);
  }

  /**
   * Vérifie et valide un code OTP
   */
  async verifyOtp(email: string, otpCode: string): Promise<boolean> {
    const otp = await this.otpModel.findOne({
      email,
      code: otpCode,
      type: 'PASSWORD_RESET',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    // Vérifier le nombre d'tentatives
    if (otp.attempts >= otp.maxAttempts) {
      throw new BadRequestException('Nombre maximum de tentatives atteint');
    }

    // Incrémenter le nombre de tentatives
    otp.attempts += 1;
    await otp.save();

    // Marquer l'OTP comme utilisé s'il est valide
    otp.isUsed = true;
    await otp.save();

    this.logger.log(`OTP vérifié avec succès pour: ${email}`);
    return true;
  }

  /**
   * Nettoie les OTPs expirés (peut être utilisé dans un cron job)
   */
  async cleanupExpiredOtps(): Promise<void> {
    const result = await this.otpModel.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isUsed: true }
      ]
    });

    this.logger.log(`Nettoyage: ${result.deletedCount} OTPs supprimés`);
  }

  /**
   * Génère un code OTP de 6 chiffres
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Envoie l'email avec le code OTP
   */
  private async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    const subject = 'Code de vérification pour réinitialiser votre mot de passe';
    const html = this.getOtpEmailTemplate(otpCode);

    await this.emailService.sendEmail(email, subject, html);
  }

  /**
   * Template HTML pour l'email OTP
   */
  private getOtpEmailTemplate(otpCode: string): string {
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
    .otp-code { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; text-align: center; }
    .otp-code h2 { margin: 0; font-size: 32px; color: #667eea; letter-spacing: 4px; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .expiry { color: #dc3545; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Code de Vérification</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification :</p>

      <div class="otp-code">
        <h2>${otpCode}</h2>
      </div>

      <div class="warning">
        <strong>⚠️ Important :</strong>
        <ul>
          <li>Ce code expire dans <span class="expiry">10 minutes</span></li>
          <li>Ne partagez ce code avec personne</li>
          <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
        </ul>
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
