import { Role } from '../../common/enums/role.enum';
export declare class CreateUserDto {
    nom: string;
    prenom: string;
    email: string;
    role: Role;
    telephone?: string;
    poste?: string;
}
