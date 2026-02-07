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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const email_module_1 = require("./email/email.module");
const documents_module_1 = require("./documents/documents.module");
const projects_module_1 = require("./projects/projects.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const tasks_module_1 = require("./tasks/tasks.module");
const bot_module_1 = require("./bot/bot.module");
const users_service_1 = require("./users/users.service");
let AppModule = class AppModule {
    configService;
    usersService;
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
    }
    async onModuleInit() {
        const adminEmail = this.configService.get('ADMIN_EMAIL', 'admin@tili.com');
        const adminPassword = this.configService.get('ADMIN_PASSWORD', 'Admin123!');
        await this.usersService.seedAdmin(adminEmail, adminPassword);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('MONGODB_URI'),
                }),
                inject: [config_1.ConfigService],
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            email_module_1.EmailModule,
            documents_module_1.DocumentsModule,
            projects_module_1.ProjectsModule,
            dashboard_module_1.DashboardModule,
            tasks_module_1.TasksModule,
            bot_module_1.BotModule,
        ],
    }),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], AppModule);
//# sourceMappingURL=app.module.js.map