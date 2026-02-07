import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadAvatarDto {
    @ApiProperty({
        description: 'Fichier avatar (image)',
        type: 'string',
        format: 'binary',
        required: false
    })
    @IsOptional()
    avatar?: any;
}

export class UpdateAvatarDto {
    @ApiProperty({ description: 'URL de l\'avatar' })
    @IsString({ message: 'L\'URL de l\'avatar doit être une chaîne de caractères' })
    @IsOptional()
    avatar?: string;
}
