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
exports.BotController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bot_service_1 = require("./bot.service");
const bot_dto_1 = require("./dto/bot.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const role_enum_1 = require("../common/enums/role.enum");
let BotController = class BotController {
    botService;
    constructor(botService) {
        this.botService = botService;
    }
    async chat(dto, user) {
        const userRole = user.role || role_enum_1.Role.CONSULTANT;
        return this.botService.chat({ message: dto.message, history: dto.history }, userRole);
    }
};
exports.BotController = BotController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un message à TILIBOT et recevoir une réponse' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bot_dto_1.BotChatDto, Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "chat", null);
exports.BotController = BotController = __decorate([
    (0, swagger_1.ApiTags)('TILIBOT'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('bot'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bot_service_1.BotService])
], BotController);
//# sourceMappingURL=bot.controller.js.map