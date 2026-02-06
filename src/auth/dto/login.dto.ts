import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'jean.dupont@tili.com', description: 'Adresse email' })
    @IsEmail({}, { message: 'Email invalide' })
    @IsNotEmpty({ message: 'L\'email est requis' })
    email: string;

    @ApiProperty({ example: 'MonMotDePasse123!', description: 'Mot de passe' })
    @IsString()
    @IsNotEmpty({ message: 'Le mot de passe est requis' })
    password: string;
}
