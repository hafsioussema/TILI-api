"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('TILI API')
        .setDescription(`
## API REST pour la gestion des utilisateurs et l'authentification

### 🔐 Authentification
- **JWT Bearer Token** : Utilisez le token d'accès dans le header \`Authorization: Bearer <token>\`
- **Expiration** : Token d'accès = 15 minutes, Refresh token = 7 jours

### 👥 Rôles
| Rôle | Description |
|------|-------------|
| **ADMIN** | Accès complet, gestion des utilisateurs |
| **CHEF_PROJET** | Gestion de projets (à implémenter) |
| **CONSULTANT** | Consultation (à implémenter) |

### 🔄 Flux d'authentification
1. L'admin crée un compte utilisateur
2. L'utilisateur reçoit un email avec ses identifiants
3. L'utilisateur se connecte avec \`POST /auth/login\`
4. L'utilisateur doit changer son mot de passe avec \`POST /auth/change-password\`

### ⚠️ Sécurité
- Mots de passe hashés avec bcrypt (10 rounds)
- Verrouillage du compte après 5 tentatives échouées (30 minutes)
- Pas de registration publique - comptes créés par l'admin uniquement
    `)
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Authentification', 'Endpoints de connexion et gestion du profil')
        .addTag('Utilisateurs', 'Gestion des utilisateurs (Admin uniquement)')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'TILI API Documentation',
    });
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`
🚀 TILI API démarrée sur le port ${port}
📚 Documentation Swagger: http://localhost:${port}/api/docs
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map