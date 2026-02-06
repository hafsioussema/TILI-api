import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @ApiProperty({ description: 'Nom de famille de l\'utilisateur' })
    @Prop({ required: true })
    nom: string;

    @ApiProperty({ description: 'Prénom de l\'utilisateur' })
    @Prop({ required: true })
    prenom: string;

    @ApiProperty({ description: 'Adresse email (identifiant de connexion)' })
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @ApiProperty({ enum: Role, description: 'Rôle de l\'utilisateur' })
    @Prop({ type: String, enum: Role, default: Role.CONSULTANT })
    role: Role;

    @ApiProperty({ description: 'Statut du compte (actif/inactif)' })
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty({ description: 'L\'utilisateur doit changer son mot de passe' })
    @Prop({ default: true })
    mustChangePassword: boolean;

    // Champs optionnels
    @ApiPropertyOptional({ description: 'Numéro de téléphone' })
    @Prop()
    telephone?: string;

    @ApiPropertyOptional({ description: 'Poste / Fonction' })
    @Prop()
    poste?: string;

    @ApiPropertyOptional({ description: 'Date de dernière connexion' })
    @Prop()
    lastLogin?: Date;

    @ApiPropertyOptional({ description: 'URL de l\'avatar' })
    @Prop()
    avatar?: string;

    @ApiProperty({ description: 'Nombre de tentatives de connexion échouées' })
    @Prop({ default: 0 })
    failedLoginAttempts: number;

    @ApiPropertyOptional({ description: 'Date de verrouillage du compte' })
    @Prop()
    lockedUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index pour les recherches (email already indexed via 'unique: true')
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
