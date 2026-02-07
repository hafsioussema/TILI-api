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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const email_service_1 = require("../email/email.service");
let UsersController = class UsersController {
    usersService;
    emailService;
    constructor(usersService, emailService) {
        this.usersService = usersService;
        this.emailService = emailService;
    }
    async create(createUserDto) {
        const { user, temporaryPassword } = await this.usersService.create(createUserDto);
        await this.emailService.sendWelcomeEmail(user.email, `${user.prenom} ${user.nom}`, temporaryPassword);
        return this.mapToResponse(user);
    }
    async findAll() {
        const users = await this.usersService.findAll();
        return users.map((user) => this.mapToResponse(user));
    }
    async findOne(id) {
        const user = await this.usersService.findById(id);
        return this.mapToResponse(user);
    }
    async update(id, updateUserDto) {
        const user = await this.usersService.update(id, updateUserDto);
        return this.mapToResponse(user);
    }
    async remove(id) {
        await this.usersService.remove(id);
    }
    async toggleStatus(id) {
        const user = await this.usersService.toggleStatus(id);
        return this.mapToResponse(user);
    }
    mapToResponse(user) {
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
            lastLogin: user.lastLogin,
            avatar: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un utilisateur (Admin uniquement)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Utilisateur créé avec succès',
        type: dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé - Admin requis' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email déjà utilisé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Liste tous les utilisateurs (Admin uniquement)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste des utilisateurs',
        type: [dto_1.UserResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé - Admin requis' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Détails d\'un utilisateur (Admin uniquement)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Détails de l\'utilisateur',
        type: dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé - Admin requis' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un utilisateur (Admin uniquement)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Utilisateur mis à jour',
        type: dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé - Admin requis' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email déjà utilisé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un utilisateur (Admin uniquement)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Utilisateur supprimé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé - Admin requis' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Activer/désactiver un compte (Admin uniquement)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statut du compte modifié',
        type: dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé - Admin requis' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleStatus", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Utilisateurs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        email_service_1.EmailService])
], UsersController);
//# sourceMappingURL=users.controller.js.map