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
exports.UpdateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const role_enum_1 = require("../../common/enums/role.enum");
class UpdateUserDto {
    nom;
    prenom;
    email;
    role;
    isActive;
    telephone;
    poste;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dupont', description: 'Nom de famille' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jean', description: 'Prénom' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'jean.dupont@tili.com', description: 'Adresse email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Email invalide' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: role_enum_1.Role, example: role_enum_1.Role.CONSULTANT, description: 'Rôle de l\'utilisateur' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(role_enum_1.Role, { message: 'Rôle invalide' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Statut du compte' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+33612345678', description: 'Numéro de téléphone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Chef de projet senior', description: 'Poste / Fonction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "poste", void 0);
//# sourceMappingURL=update-user.dto.js.map