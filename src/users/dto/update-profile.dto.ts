import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'Dupont', description: 'Nom de famille' })
    @IsOptional()
    @IsString()
    nom?: string;

    @ApiPropertyOptional({ example: 'Jean', description: 'Prénom' })
    @IsOptional()
    @IsString()
    prenom?: string;

    @ApiPropertyOptional({ example: '+33612345678', description: 'Numéro de téléphone' })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiPropertyOptional({ example: 'Consultant senior', description: 'Poste / Fonction' })
    @IsOptional()
    @IsString()
    poste?: string;

    @ApiPropertyOptional({ example: '/uploads/avatars/avatar.jpg', description: 'Chemin de l\'avatar' })
    @IsOptional()
    @IsString()
    avatar?: string;
}
