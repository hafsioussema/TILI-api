import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto, AuthResponseDto } from './dto';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from '../users/dto';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    changePassword(user: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<{
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
    updateProfile(user: any, updateProfileDto: UpdateProfileDto): Promise<import("../users/schemas").UserDocument>;
    refreshToken(user: any): Promise<{
        accessToken: string;
    }>;
}
