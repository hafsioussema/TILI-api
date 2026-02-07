import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    HttpCode,
    HttpStatus,
    Patch,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto, AuthResponseDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from '../users/dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Connexion utilisateur' })
    @ApiResponse({
        status: 200,
        description: 'Connexion réussie',
        type: AuthResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Identifiants invalides' })
    @ApiResponse({ status: 403, description: 'Compte désactivé ou verrouillé' })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Changer son mot de passe' })
    @ApiResponse({ status: 200, description: 'Mot de passe modifié' })
    @ApiResponse({ status: 401, description: 'Non authentifié ou mot de passe actuel incorrect' })
    @ApiResponse({ status: 403, description: 'Le nouveau mot de passe doit être différent' })
    async changePassword(
        @CurrentUser() user: any,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<{ message: string }> {
        return this.authService.changePassword(user.userId, changePasswordDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Récupérer son profil' })
    @ApiResponse({ status: 200, description: 'Profil récupéré' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async getProfile(@CurrentUser() user: any) {
        return this.authService.getProfile(user.userId);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mettre à jour son profil' })
    @ApiResponse({ status: 200, description: 'Profil mis à jour' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async updateProfile(
        @CurrentUser() user: any,
        @Body() updateProfileDto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(user.userId, updateProfileDto);
    }

    @Post('profile/avatar')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `avatar-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
                return callback(new BadRequestException('Seules les images sont autorisées (jpg, png, gif, webp)'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB max
        },
    }))
    @ApiOperation({ summary: 'Uploader une photo de profil' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Avatar mis à jour' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiResponse({ status: 400, description: 'Fichier invalide' })
    async uploadAvatar(
        @CurrentUser() user: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Aucun fichier fourni');
        }

        const avatarUrl = `/uploads/avatars/${file.filename}`;
        await this.usersService.updateProfile(user.userId, { avatar: avatarUrl });

        return { 
            message: 'Avatar mis à jour avec succès',
            avatar: avatarUrl,
        };
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Demander un code OTP pour réinitialiser le mot de passe' })
    @ApiResponse({ status: 200, description: 'Code OTP envoyé par email' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Réinitialiser le mot de passe avec le code OTP' })
    @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé' })
    @ApiResponse({ status: 400, description: 'Code OTP invalide ou expiré' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Rafraîchir le token d\'accès' })
    @ApiResponse({ status: 200, description: 'Nouveau token généré' })
    @ApiResponse({ status: 401, description: 'Token invalide' })
    async refreshToken(@CurrentUser() user: any): Promise<{ accessToken: string }> {
        return this.authService.refreshToken(user.userId, user.email);
    }
}
