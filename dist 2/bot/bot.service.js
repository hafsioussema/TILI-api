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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const role_enum_1 = require("../common/enums/role.enum");
const SYSTEM_PROMPT = `Tu es TILIBOT, l'assistant virtuel de la plateforme TILI (gestion de projets et documents).

## Contexte de l'application TILI
- **Projets** : création, modification, clôture, liste et détails. Chaque projet a un chef de projet, des membres, des tâches, des documents, une progression et un statut (ACTIVE, COMPLETED, ARCHIVED).
- **Tâches** : liées à un projet, avec statut (TODO, IN_PROGRESS, DONE), priorité, assignation, dates.
- **Documents** : uploadés par projet (rapports, CR de réunion, administratifs, etc.), avec historique des versions.
- **Tableau de bord** : statistiques (projets actifs/clôturés, documents, taux de progression), activités récentes.

## Rôles et permissions
- **ADMIN** : accès total. CRUD projets, tâches, documents, utilisateurs. Peut clôturer tout projet.
- **CHEF_PROJET** : gère ses projets (CRUD projet/tâches/documents), peut clôturer ses projets. Voit uniquement ses projets et ceux où il est membre.
- **CONSULTANT** : accès en lecture aux projets auxquels il est affecté (membre). Peut consulter tâches et documents, pas de modification projet.

Réponds toujours en français, de façon concise et utile. Aide l'utilisateur selon son rôle : conseils pour gérer projets/tâches (admin, chef de projet) ou pour consulter les infos (consultant). Si tu ne connais pas une donnée précise (ex. nom d'un projet), invite à consulter l'interface.`;
let BotService = class BotService {
    configService;
    groq = null;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GROQ_API_KEY');
        if (apiKey) {
            this.groq = new groq_sdk_1.default({ apiKey });
        }
    }
    getRoleContext(role) {
        switch (role) {
            case role_enum_1.Role.ADMIN:
                return "L'utilisateur est **Administrateur** : il peut tout gérer (projets, tâches, documents, utilisateurs).";
            case role_enum_1.Role.CHEF_PROJET:
                return "L'utilisateur est **Chef de projet** : il peut gérer ses projets (CRUD projet, tâches, documents) et clôturer ses projets.";
            case role_enum_1.Role.CONSULTANT:
                return "L'utilisateur est **Consultant** : il consulte les projets auxquels il est affecté (tâches, documents). Pas de modification des projets.";
            default:
                return "Rôle utilisateur non spécifié.";
        }
    }
    async chat(dto, userRole) {
        if (!this.groq) {
            return {
                reply: "TILIBOT est désactivé : clé API Groq (GROQ_API_KEY) non configurée. Configurez-la dans le fichier .env du backend.",
            };
        }
        const roleContext = this.getRoleContext(userRole);
        const systemContent = `${SYSTEM_PROMPT}\n\n${roleContext}`;
        const messages = [
            { role: 'system', content: systemContent },
        ];
        if (dto.history && dto.history.length > 0) {
            const lastHistory = dto.history.slice(-10);
            for (const m of lastHistory) {
                if (m.role === 'user' || m.role === 'assistant') {
                    messages.push({ role: m.role, content: m.content });
                }
            }
        }
        messages.push({ role: 'user', content: dto.message });
        const model = this.configService.get('GROQ_MODEL', 'llama-3.1-8b-instant');
        const completion = await this.groq.chat.completions.create({
            model,
            messages,
            max_tokens: 1024,
            temperature: 0.4,
        });
        const reply = completion.choices[0]?.message?.content?.trim() ||
            "Désolé, je n'ai pas pu générer une réponse.";
        return { reply };
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BotService);
//# sourceMappingURL=bot.service.js.map