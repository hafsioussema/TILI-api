import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    HttpCode,
    HttpStatus,
    Patch,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto, AuthResponseDto } from './dto';
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
