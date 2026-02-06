import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ description: 'Mot de passe actuel' })
    @IsString()
    @IsNotEmpty({ message: 'Le mot de passe actuel est requis' })
    currentPassword: string;

    @ApiProperty({
        description: 'Nouveau mot de passe (min 8 caractères, 1 majuscule, 1 chiffre)',
        example: 'NouveauMdp123!',
    })
    @IsString()
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Le mot de passe doit contenir au moins une majuscule et un chiffre',
    })
    newPassword: string;
}
