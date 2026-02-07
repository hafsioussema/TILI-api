import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
export declare class UsersService {
    private userModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>);
    generateTemporaryPassword(length?: number): string;
    hashPassword(password: string): Promise<string>;
    create(createUserDto: CreateUserDto): Promise<{
        user: UserDocument;
        temporaryPassword: string;
    }>;
    findAll(): Promise<UserDocument[]>;
    findById(id: string): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument>;
    updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument>;
    remove(id: string): Promise<void>;
    toggleStatus(id: string): Promise<UserDocument>;
    updatePassword(id: string, newPassword: string): Promise<void>;
    updateLastLogin(id: string): Promise<void>;
    incrementFailedAttempts(id: string): Promise<{
        isLocked: boolean;
        lockedUntil?: Date;
    }>;
    isAccountLocked(user: UserDocument): boolean;
    seedAdmin(email: string, password: string): Promise<void>;
}
