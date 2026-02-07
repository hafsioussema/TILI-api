"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
const role_enum_1 = require("../../common/enums/role.enum");
let User = class User {
    nom;
    prenom;
    email;
    password;
    role;
    isActive;
    mustChangePassword;
    telephone;
    poste;
    lastLogin;
    avatar;
    failedLoginAttempts;
    lockedUntil;
};
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom de famille de l\'utilisateur' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prénom de l\'utilisateur' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adresse email (identifiant de connexion)' }),
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: role_enum_1.Role, description: 'Rôle de l\'utilisateur' }),
    (0, mongoose_1.Prop)({ type: String, enum: role_enum_1.Role, default: role_enum_1.Role.CONSULTANT }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Statut du compte (actif/inactif)' }),
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'L\'utilisateur doit changer son mot de passe' }),
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "mustChangePassword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Numéro de téléphone' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Poste / Fonction' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "poste", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de dernière connexion' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL de l\'avatar' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de tentatives de connexion échouées' }),
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de verrouillage du compte' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lockedUntil", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ role: 1 });
exports.UserSchema.index({ isActive: 1 });
//# sourceMappingURL=user.schema.js.map