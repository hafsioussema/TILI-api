import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class UserResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    id: string;

    @ApiProperty({ example: 'Dupont' })
    nom: string;

    @ApiProperty({ example: 'Jean' })
    prenom: string;

    @ApiProperty({ example: 'jean.dupont@tili.com' })
    email: string;

    @ApiProperty({ enum: Role, example: Role.CONSULTANT })
    role: Role;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: false })
    mustChangePassword: boolean;

    @ApiPropertyOptional({ example: '+33612345678' })
    telephone?: string;

    @ApiPropertyOptional({ example: 'Chef de projet senior' })
    poste?: string;

    @ApiPropertyOptional()
    lastLogin?: Date;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    avatar?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
