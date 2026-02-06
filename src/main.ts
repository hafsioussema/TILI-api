import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'TILI API Documentation',
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`
🚀 TILI API démarrée sur le port ${port}
📚 Documentation Swagger: http://localhost:${port}/api/docs
  `);
}

bootstrap();
