"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("./schemas/user.schema");
const role_enum_1 = require("../common/enums/role.enum");
let UsersService = UsersService_1 = class UsersService {
    userModel;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userModel) {
        this.userModel = userModel;
    }
    generateTemporaryPassword(length = 12) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
    async create(createUserDto) {
        const existingUser = await this.userModel.findOne({ email: createUserDto.email.toLowerCase() });
        if (existingUser) {
            throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà');
        }
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
    async findAll() {
        return this.userModel.find().select('-password').exec();
    }
    async findById(id) {
        const user = await this.userModel.findById(id).select('-password').exec();
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email: email.toLowerCase() }).exec();
    }
    async update(id, updateUserDto) {
        if (updateUserDto.email) {
            const existingUser = await this.userModel.findOne({
                email: updateUserDto.email.toLowerCase(),
                _id: { $ne: id },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà');
            }
            updateUserDto.email = updateUserDto.email.toLowerCase();
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        this.logger.log(`Utilisateur mis à jour: ${user.email}`);
        return user;
    }
    async updateProfile(id, updateProfileDto) {
        const user = await this.userModel
            .findByIdAndUpdate(id, updateProfileDto, { new: true })
            .select('-password')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }
    async remove(id) {
        const result = await this.userModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        this.logger.log(`Utilisateur supprimé: ${result.email}`);
    }
    async toggleStatus(id) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        user.isActive = !user.isActive;
        await user.save();
        this.logger.log(`Statut utilisateur ${user.email} changé à: ${user.isActive ? 'actif' : 'inactif'}`);
        return user;
    }
    async updatePassword(id, newPassword) {
        const hashedPassword = await this.hashPassword(newPassword);
        await this.userModel.findByIdAndUpdate(id, {
            password: hashedPassword,
            mustChangePassword: false,
        }).exec();
    }
    async updateLastLogin(id) {
        await this.userModel.findByIdAndUpdate(id, {
            lastLogin: new Date(),
            failedLoginAttempts: 0,
            lockedUntil: null,
        }).exec();
    }
    async incrementFailedAttempts(id) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            return { isLocked: false };
        }
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
            user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            await user.save();
            return { isLocked: true, lockedUntil: user.lockedUntil };
        }
        await user.save();
        return { isLocked: false };
    }
    isAccountLocked(user) {
        if (!user.lockedUntil)
            return false;
        return new Date() < user.lockedUntil;
    }
    async seedAdmin(email, password) {
        const existingAdmin = await this.userModel.findOne({ role: role_enum_1.Role.ADMIN }).exec();
        if (existingAdmin) {
            this.logger.log('Admin existant trouvé, seed ignoré');
            return;
        }
        const hashedPassword = await this.hashPassword(password);
        const admin = new this.userModel({
            nom: 'Admin',
            prenom: 'System',
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role_enum_1.Role.ADMIN,
            isActive: true,
            mustChangePassword: false,
        });
        await admin.save();
        this.logger.log(`Admin par défaut créé: ${email}`);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map