import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
import { Role } from '../common/enums/role.enum';
import { randomInt } from 'node:crypto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    /**
     * Génère un mot de passe temporaire aléatoire
     */
    generateTemporaryPassword(length = 12): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        return Array.from({ length }, () => chars.charAt(randomInt(chars.length))).join('');
    }

    /**
     * Hash un mot de passe avec bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    /**
     * Crée un nouvel utilisateur (réservé aux admins)
     * Retourne le mot de passe temporaire en clair pour l'envoi par email
     */
    async create(createUserDto: CreateUserDto): Promise<{ user: UserDocument; temporaryPassword: string }> {
        // Vérifier si l'email existe déjà
        const existingUser = await this.userModel.findOne({ email: createUserDto.email.toLowerCase() });
        if (existingUser) {
            throw new ConflictException('Un utilisateur avec cet email existe déjà');
        }

        // Générer un mot de passe temporaire
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await this.hashPassword(temporaryPassword);

        const user = new this.userModel({
            ...createUserDto,
            email: createUserDto.email.toLowerCase(),
            password: hashedPassword,
            mustChangePassword: true,
        });

        const savedUser = await user.save();
        this.logger.log(`Utilisateur créé: ${savedUser.email}`);

        return { user: savedUser, temporaryPassword };
    }

    /**
     * Récupère tous les utilisateurs
     */
    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find().select('-password').exec();
    }

    /**
     * Recherche un chef de projet (Admin ou Chef) par nom complet (ex: "Jean Dupont" ou "Dupont Jean")
     */
    async findManagerByName(fullName: string): Promise<UserDocument | null> {
        const managers = await this.userModel
            .find({ role: { $in: ['ADMIN', 'CHEF_PROJET'] } })
            .select('-password')
            .exec();
        return this.matchUserByName(managers, fullName);
    }

    /**
     * Recherche un utilisateur par nom (tous rôles)
     */
    async findUserByName(fullName: string): Promise<UserDocument | null> {
        const all = await this.userModel.find().select('-password').exec();
        return this.matchUserByName(all, fullName);
    }

    private matchUserByName(users: UserDocument[], fullName: string): UserDocument | null {
        const q = fullName.trim().toLowerCase();
        return users.find((u) => {
            const prenomNom = `${(u.prenom || '').toLowerCase()} ${(u.nom || '').toLowerCase()}`.trim();
            const nomPrenom = `${(u.nom || '').toLowerCase()} ${(u.prenom || '').toLowerCase()}`.trim();
            return prenomNom.includes(q) || nomPrenom.includes(q) || (u.nom?.toLowerCase().includes(q)) || (u.prenom?.toLowerCase().includes(q));
        }) || null;
    }

    /**
     * Récupère un utilisateur par son ID
     */
    async findById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id).select('-password').exec();
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }

    /**
     * Récupère un utilisateur par son email (avec mot de passe pour l'auth)
     */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email: email.toLowerCase() }).exec();
    }

    /**
     * Met à jour un utilisateur (réservé aux admins)
     */
    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
        // Si l'email est modifié, vérifier qu'il n'existe pas déjà
        if (updateUserDto.email) {
            const existingUser = await this.userModel.findOne({
                email: updateUserDto.email.toLowerCase(),
                _id: { $ne: id },
            });
            if (existingUser) {
                throw new ConflictException('Un utilisateur avec cet email existe déjà');
            }
            updateUserDto.email = updateUserDto.email.toLowerCase();
        }

        const user = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password')
            .exec();

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        this.logger.log(`Utilisateur mis à jour: ${user.email}`);
        return user;
    }

    /**
     * Met à jour le profil d'un utilisateur (par l'utilisateur lui-même)
     */
    async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument> {
        const user = await this.userModel
            .findByIdAndUpdate(id, updateProfileDto, { new: true })
            .select('-password')
            .exec();

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        return user;
    }

    /**
     * Supprime un utilisateur
     */
    async remove(id: string): Promise<void> {
        const result = await this.userModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        this.logger.log(`Utilisateur supprimé: ${result.email}`);
    }

    /**
     * Active ou désactive un compte utilisateur
     */
    async toggleStatus(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        user.isActive = !user.isActive;
        await user.save();

        this.logger.log(`Statut utilisateur ${user.email} changé à: ${user.isActive ? 'actif' : 'inactif'}`);
        return user;
    }

    /**
     * Met à jour le mot de passe d'un utilisateur
     */
    async updatePassword(id: string, newPassword: string): Promise<void> {
        const hashedPassword = await this.hashPassword(newPassword);
        await this.userModel.findByIdAndUpdate(id, {
            password: hashedPassword,
            mustChangePassword: false,
        }).exec();
    }

    /**
     * Met à jour la date de dernière connexion
     */
    async updateLastLogin(id: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(id, {
            lastLogin: new Date(),
            failedLoginAttempts: 0,
            lockedUntil: null,
        }).exec();
    }

    /**
     * Incrémente le compteur de tentatives échouées
     */
    async incrementFailedAttempts(id: string): Promise<{ isLocked: boolean; lockedUntil?: Date }> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            return { isLocked: false };
        }

        user.failedLoginAttempts += 1;

        // Verrouiller après 5 tentatives échouées
        if (user.failedLoginAttempts >= 5) {
            user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            await user.save();
            return { isLocked: true, lockedUntil: user.lockedUntil };
        }

        await user.save();
        return { isLocked: false };
    }

    /**
     * Vérifie si un compte est verrouillé
     */
    isAccountLocked(user: UserDocument): boolean {
        if (!user.lockedUntil) return false;
        return new Date() < user.lockedUntil;
    }

    /**
     * Crée l'admin par défaut si aucun admin n'existe
     */
    async seedAdmin(email: string, password?: string): Promise<void> {
        const existingAdmin = await this.userModel.findOne({ role: Role.ADMIN }).exec();
        if (existingAdmin) {
            this.logger.log('Admin existant trouvé, seed ignoré');
            return;
        }

        const normalizedEmail = email?.trim().toLowerCase();
        if (
            !normalizedEmail ||
            normalizedEmail.startsWith('replace-with-') ||
            normalizedEmail.endsWith('@example.com')
        ) {
            throw new Error('Set a real ADMIN_EMAIL before bootstrapping the first administrator.');
        }
        if (
            !password?.trim() ||
            password === 'Admin123!' ||
            password.startsWith('replace-with-')
        ) {
            throw new Error(
                'Set a unique ADMIN_PASSWORD before bootstrapping the first administrator. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64url\'))"',
            );
        }

        const hashedPassword = await this.hashPassword(password);
        const admin = new this.userModel({
            nom: 'Admin',
            prenom: 'System',
            email: email.toLowerCase(),
            password: hashedPassword,
            role: Role.ADMIN,
            isActive: true,
            mustChangePassword: true,
        });

        await admin.save();
        this.logger.log(`Initial administrator account created: ${normalizedEmail}`);
    }
}
