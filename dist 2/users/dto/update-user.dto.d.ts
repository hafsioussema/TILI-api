import { Role } from '../../common/enums/role.enum';
export declare class UpdateUserDto {
    nom?: string;
    prenom?: string;
    email?: string;
    role?: Role;
    isActive?: boolean;
    telephone?: string;
    poste?: string;
}
