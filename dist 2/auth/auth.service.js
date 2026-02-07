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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        if (this.usersService.isAccountLocked(user)) {
            throw new common_1.ForbiddenException(`Compte verrouillé. Réessayez après ${user.lockedUntil?.toLocaleTimeString()}`);
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Ce compte a été désactivé');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            await this.usersService.incrementFailedAttempts(user._id.toString());
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect');
        }
        await this.usersService.updateLastLogin(user._id.toString());
        const tokens = await this.generateTokens(user);
        this.logger.log(`Connexion réussie: ${user.email}`);
        return {
            ...tokens,
            user: {
                id: user._id.toString(),
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
            },
        };
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.usersService.findByEmail((await this.usersService.findById(userId)).email);
        if (!user) {
            throw new common_1.UnauthorizedException('Utilisateur non trouvé');
        }
        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Mot de passe actuel incorrect');
        }
        const isSamePassword = await bcrypt.compare(changePasswordDto.newPassword, user.password);
        if (isSamePassword) {
            throw new common_1.ForbiddenException('Le nouveau mot de passe doit être différent de l\'ancien');
        }
        await this.usersService.updatePassword(userId, changePasswordDto.newPassword);
        this.logger.log(`Mot de passe changé pour: ${user.email}`);
        return { message: 'Mot de passe modifié avec succès' };
    }
    async refreshToken(userId, email) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Session invalide');
        }
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }
    async getProfile(userId) {
        const user = await this.usersService.findById(userId);
        return {
            id: user._id.toString(),
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
            telephone: user.telephone,
            poste: user.poste,
            avatar: user.avatar,
            lastLogin: user.lastLogin,
        };
    }
    async generateTokens(user) {
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: '7d',
            }),
        ]);
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map