import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: '+33612345678', description: 'Numéro de téléphone' })
    @IsOptional()
    @IsString()
    telephone?: string;

    @ApiPropertyOptional({ example: 'Consultant senior', description: 'Poste / Fonction' })
    @IsOptional()
    @IsString()
    poste?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'URL de l\'avatar' })
    @IsOptional()
    @IsUrl({}, { message: 'URL invalide' })
    avatar?: string;
}
