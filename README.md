# TILI API

API REST NestJS pour la gestion des utilisateurs et l'authentification avec JWT.

## 🚀 Fonctionnalités

- ✅ Authentification JWT (access token + refresh token)
- ✅ Gestion des rôles (ADMIN, CHEF_PROJET, CONSULTANT)
- ✅ Création de comptes par l'administrateur uniquement
- ✅ Envoi d'emails SMTP (bienvenue, changement de mot de passe)
- ✅ Verrouillage de compte après 5 tentatives échouées
- ✅ Documentation Swagger complète
- ✅ Tests unitaires et e2e

## 📋 Prérequis

- Node.js 18+
- MongoDB 6+
- Serveur SMTP (ou Mailtrap pour le développement)

## ⚙️ Installation

```bash
# Cloner le projet
git clone <repository>
# Naviguer vers le projet
cd /Users/chkilisaif/Documents/tili-api

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

## 🔧 Configuration

Créez un fichier `.env` à partir de `.env.example` :

```env
# App
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tili-db

# JWT
JWT_SECRET=votre-secret-très-sécurisé
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=votre-email@example.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM="TILI App <noreply@example.com>"

# Admin par défaut
ADMIN_EMAIL=admin@tili.com
ADMIN_PASSWORD=Admin123!
```

## 🏃 Démarrage

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 Documentation API

Une fois l'application démarrée, accédez à Swagger :

```
http://localhost:3000/api/docs
```

## 🔐 Authentification

### Flux d'authentification

1. **L'admin crée un compte** : `POST /users`
2. **L'utilisateur reçoit un email** avec ses identifiants
3. **L'utilisateur se connecte** : `POST /auth/login`
4. **L'utilisateur change son mot de passe** : `POST /auth/change-password`

### Endpoints

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Connexion |
| GET | `/auth/profile` | ✅ | Profil utilisateur |
| PATCH | `/auth/profile` | ✅ | Modifier son profil |
| POST | `/auth/change-password` | ✅ | Changer mot de passe |
| POST | `/auth/refresh` | ✅ | Rafraîchir le token |

### Gestion des utilisateurs (Admin)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/users` | Liste des utilisateurs |
| GET | `/users/:id` | Détails utilisateur |
| POST | `/users` | Créer un utilisateur |
| PATCH | `/users/:id` | Modifier un utilisateur |
| DELETE | `/users/:id` | Supprimer un utilisateur |
| PATCH | `/users/:id/toggle-status` | Activer/désactiver |

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 📁 Structure du projet

```
src/
├── auth/                   # Module d'authentification
│   ├── decorators/         # @Roles, @CurrentUser
│   ├── dto/                # LoginDto, ChangePasswordDto
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── strategies/         # JWT Strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                  # Module utilisateurs
│   ├── dto/                # CreateUserDto, UpdateUserDto
│   ├── schemas/            # User Mongoose Schema
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── email/                  # Module email
│   ├── email.service.ts
│   └── email.module.ts
├── common/                 # Éléments partagés
│   └── enums/              # Role enum
├── app.module.ts
└── main.ts
```

## 🔒 Sécurité

- Mots de passe hashés avec **bcrypt** (10 rounds)
- Tokens JWT avec expiration
- Verrouillage de compte après **5 tentatives** (30 minutes)
- Validation des données avec **class-validator**
- Pas de registration publique

## 👥 Rôles

| Rôle | Description |
|------|-------------|
| `ADMIN` | Accès complet, gestion des utilisateurs |
| `CHEF_PROJET` | Gestion de projets (à implémenter) |
| `CONSULTANT` | Consultation (à implémenter) |

## 📝 Licence

MIT
