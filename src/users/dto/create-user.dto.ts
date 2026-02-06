import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
    @ApiProperty({ example: 'Dupont', description: 'Nom de famille' })
    @IsNotEmpty({ message: 'Le nom est requis' })
    @IsString()
    nom: string;

    @ApiProperty({ example: 'Jean', description: 'Prénom' })
    @IsNotEmpty({ message: 'Le prénom est requis' })
    @IsString()
    prenom: string;

    @ApiProperty({ example: 'jean.dupont@tili.com', description: 'Adresse email' })
    @IsEmail({}, { message: 'Email invalide' })
    @IsNotEmpty({ message: 'L\'email est requis' })
    email: string;

    @ApiProperty({ enum: Role, example: Role.CONSULTANT, description: 'Rôle de l\'utilisateur' })
    @IsEnum(Role, { message: 'Rôle invalide' })
    @IsNotEmpty({ message: 'Le rôle est requis' })
    role: Role;

    @ApiPropertyOptional({ example: '+33612345678', description: 'Numéro de téléphone' })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiPropertyOptional({ example: 'Chef de projet senior', description: 'Poste / Fonction' })
    @IsOptional()
    @IsString()
    poste?: string;
}
