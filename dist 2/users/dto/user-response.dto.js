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
exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const role_enum_1 = require("../../common/enums/role.enum");
class UserResponseDto {
    id;
    nom;
    prenom;
    email;
    role;
    isActive;
    mustChangePassword;
    telephone;
    poste;
    lastLogin;
    avatar;
    createdAt;
    updatedAt;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dupont' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jean' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'jean.dupont@tili.com' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: role_enum_1.Role, example: role_enum_1.Role.CONSULTANT }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "mustChangePassword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+33612345678' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Chef de projet senior' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "poste", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "lastLogin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.jpg' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=user-response.dto.js.map