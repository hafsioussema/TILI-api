import { Role } from '../../common/enums/role.enum';
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        nom: string;
        prenom: string;
        role: Role;
        mustChangePassword: boolean;
    };
}
