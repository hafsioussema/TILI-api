import { Role } from '../../common/enums/role.enum';
export declare class UserResponseDto {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: Role;
    isActive: boolean;
    mustChangePassword: boolean;
    telephone?: string;
    poste?: string;
    lastLogin?: Date;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}
