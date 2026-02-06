import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Dupont', description: 'Nom de famille' })
    @IsOptional()
    @IsString()
    nom?: string;

    @ApiPropertyOptional({ example: 'Jean', description: 'Prénom' })
    @IsOptional()
    @IsString()
    prenom?: string;

    @ApiPropertyOptional({ example: 'jean.dupont@tili.com', description: 'Adresse email' })
    @IsOptional()
    @IsEmail({}, { message: 'Email invalide' })
    email?: string;

    @ApiPropertyOptional({ enum: Role, example: Role.CONSULTANT, description: 'Rôle de l\'utilisateur' })
    @IsOptional()
    @IsEnum(Role, { message: 'Rôle invalide' })
    role?: Role;

    @ApiPropertyOptional({ example: true, description: 'Statut du compte' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: '+33612345678', description: 'Numéro de téléphone' })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiPropertyOptional({ example: 'Chef de projet senior', description: 'Poste / Fonction' })
    @IsOptional()
    @IsString()
    poste?: string;
}
