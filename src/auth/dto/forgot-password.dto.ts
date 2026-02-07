import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ description: 'Adresse email de l\'utilisateur' })
    @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
    @IsNotEmpty({ message: 'L\'email est requis' })
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty({ description: 'Adresse email de l\'utilisateur' })
    @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
    @IsNotEmpty({ message: 'L\'email est requis' })
    email: string;

    @ApiProperty({ description: 'Code OTP reçu par email' })
    @IsNotEmpty({ message: 'Le code OTP est requis' })
    otpCode: string;

    @ApiProperty({ description: 'Nouveau mot de passe' })
    @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
    newPassword: string;
}
