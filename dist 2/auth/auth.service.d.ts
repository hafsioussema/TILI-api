import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto, ChangePasswordDto, AuthResponseDto } from './dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(userId: string, email: string): Promise<{
        accessToken: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        nom: string;
        prenom: string;
        email: string;
        role: import("../common/enums").Role;
        isActive: boolean;
        mustChangePassword: boolean;
        telephone: string | undefined;
        poste: string | undefined;
        avatar: string | undefined;
        lastLogin: Date | undefined;
    }>;
    private generateTokens;
}
