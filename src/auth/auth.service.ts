import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, ChangePasswordDto, AuthResponseDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private otpService: OtpService,
    ) { }

    /**
     * Authentifie un utilisateur et retourne les tokens
     */
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Vérifier si le compte est verrouillé
        if (this.usersService.isAccountLocked(user)) {
            throw new ForbiddenException(
                `Compte verrouillé. Réessayez après ${user.lockedUntil?.toLocaleTimeString()}`,
            );
        }

        // Vérifier si le compte est actif
        if (!user.isActive) {
            throw new ForbiddenException('Ce compte a été désactivé');
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            await this.usersService.incrementFailedAttempts(user._id.toString());
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Mettre à jour la dernière connexion
        await this.usersService.updateLastLogin(user._id.toString());

        // Générer les tokens
        const tokens = await this.generateTokens(user);

        this.logger.log(`Connexion réussie: ${user.email}`);

        return {
            ...tokens,
            user: {
                id: user._id.toString(),
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
            },
        };
    }

    /**
     * Change le mot de passe d'un utilisateur
     */
    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto,
    ): Promise<{ message: string }> {
        const user = await this.usersService.findByEmail(
            (await this.usersService.findById(userId)).email,
        );

        if (!user) {
            throw new UnauthorizedException('Utilisateur non trouvé');
        }

        // Vérifier le mot de passe actuel
        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Mot de passe actuel incorrect');
        }

        // Vérifier que le nouveau mot de passe est différent
        const isSamePassword = await bcrypt.compare(
            changePasswordDto.newPassword,
            user.password,
        );

        if (isSamePassword) {
            throw new ForbiddenException(
                'Le nouveau mot de passe doit être différent de l\'ancien',
            );
        }

        await this.usersService.updatePassword(userId, changePasswordDto.newPassword);

        this.logger.log(`Mot de passe changé pour: ${user.email}`);

        return { message: 'Mot de passe modifié avec succès' };
    }

    /**
     * Rafraîchit le token d'accès
     */
    async refreshToken(userId: string, email: string): Promise<{ accessToken: string }> {
        const user = await this.usersService.findByEmail(email);

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Session invalide');
        }

        const payload: JwtPayload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
    }

    /**
     * Récupère le profil de l'utilisateur authentifié
     */
    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        return {
            id: user._id.toString(),
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
            telephone: user.telephone,
            poste: user.poste,
            avatar: user.avatar,
            lastLogin: user.lastLogin,
        };
    }

    /**
     * Demande de réinitialisation de mot de passe - envoie un code OTP par email
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.usersService.findByEmail(forgotPasswordDto.email);

        // On ne révèle pas si l'email existe ou non pour des raisons de sécurité
        if (user && user.isActive) {
            await this.otpService.generateAndSendOtp(forgotPasswordDto.email);
            this.logger.log(`OTP envoyé pour réinitialisation: ${forgotPasswordDto.email}`);
        }

        return { message: 'Si cet email existe, un code de vérification a été envoyé.' };
    }

    /**
     * Réinitialise le mot de passe avec le code OTP
     */
    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const { email, otpCode, newPassword } = resetPasswordDto;

        // Vérifier le code OTP
        await this.otpService.verifyOtp(email, otpCode);

        // Trouver l'utilisateur
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('Utilisateur non trouvé');
        }

        // Mettre à jour le mot de passe
        await this.usersService.updatePassword(user._id.toString(), newPassword);

        this.logger.log(`Mot de passe réinitialisé pour: ${email}`);

        return { message: 'Mot de passe réinitialisé avec succès' };
    }

    /**
     * Génère les tokens d'accès et de rafraîchissement
     */
    private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
        const payload: JwtPayload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: '7d',
            }),
        ]);

        return { accessToken, refreshToken };
    }
}
