import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { Role } from '../common/enums/role.enum';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { ConversationService } from './conversation.service';
import { ProjectStatus } from '../common/enums/document.enum';
import { TILI_TOOLS } from './tools/tool-schemas';

export interface BotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BotChatDto {
  message: string;
  history?: BotMessage[];
}

const SYSTEM_PROMPT = `Tu es TILIBOT, l'assistant virtuel de la plateforme TILI. Tu peux effectuer de VRAIES actions : lister/créer/modifier/clôturer des projets, et lister/créer/modifier/supprimer des tâches.

Utilise les outils (fonctions) fournis pour exécuter les demandes de l'utilisateur. Après chaque appel d'outil, résume le résultat en français de façon claire et concise.
- Pour lister : présente les éléments par leurs noms et statuts uniquement.
- Pour créer/modifier/supprimer : confirme l'action et donne un résumé (ex. "Projet X créé", "Tâche Y passée en terminée").
Respecte les permissions selon le rôle (Admin, Chef de projet, Consultant). Réponds toujours en français.

IMPORTANT - Chercher vs Supprimer : "Chercher projet aa", "voir projet aa", "trouver projet aa" = utiliser get_project ou list_projects. "Supprimer projet aa" = utiliser delete_project avec projectName: "aa". Ne jamais appeler delete_project pour une demande de recherche.
IMPORTANT - Membres d'un projet : "Qui sont les membres du projet X", "lister les membres du projet Refonte" = utiliser get_project(projectName: "X"). La réponse du projet contient le chef de projet (managerId) et la liste des membres (members). Présente-les clairement.
IMPORTANT - Toutes les tâches : "Marquer toutes les tâches du projet X comme terminées" = utiliser update_all_tasks_status(projectName: "X", status: "DONE"). Ne pas appeler update_task en boucle.
IMPORTANT - Noms vs IDs : Passer le NOM du projet (ex: "Refonte Platforme") dans projectId ou projectName. Ne JAMAIS mentionner d'IDs dans tes réponses à l'utilisateur.

Si l'utilisateur demande une action que tu ne peux pas réaliser avec les outils disponibles (ex: envoyer un email, modifier un document, autre chose hors CRUD projets/tâches), réponds exactement : "Je n'ai pas encore appris à faire cela pour le moment. Merci de le faire manuellement."

IMPORTANT : Toujours terminer complètement tes phrases et tes réponses. Ne jamais couper une phrase en milieu de mot ou de phrase. Si tu dois expliquer une erreur ou proposer des alternatives, fournis une réponse complète et cohérente.`;

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  private groq: Groq | null = null;
  private readonly model: string;
  private readonly maxToolRounds = 5;

  constructor(
    private readonly configService: ConfigService,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly conversationService: ConversationService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.model = this.configService.get<string>('GROQ_MODEL', 'llama-3.3-70b-versatile');
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  private serialize(obj: any): string {
    if (obj === null || obj === undefined) return JSON.stringify(obj);
    if (typeof obj !== 'object') return JSON.stringify(obj);
    try {
      const plain = typeof obj.toObject === 'function' ? obj.toObject() : obj;
      const cleaned = JSON.parse(JSON.stringify(plain));
      return JSON.stringify(cleaned, null, 0);
    } catch {
      return JSON.stringify(String(obj));
    }
  }

  private isValidObjectId(id: string): boolean {
    return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id.trim());
  }

  /** Enregistre les messages en base sans faire échouer la requête en cas d'erreur. */
  private async saveMessages(
    userId: string,
    newMessages: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<void> {
    if (!userId?.trim()) return;
    try {
      await this.conversationService.appendMessages(userId, newMessages);
    } catch (err) {
      this.logger.warn('Conversation save failed (reply still returned)', err);
    }
  }

  /** Normalise l'entrée utilisateur : "projet aa", "supprimer projet aa" -> "aa" */
  private normalizeProjectIdOrName(input: string): string {
    let s = (input || '').trim();
    const prefixes = [
      /^supprimer\s+projet\s+/i,
      /^clôturer\s+projet\s+/i,
      /^modifier\s+projet\s+/i,
      /^projet\s+/i,
    ];
    for (const re of prefixes) {
      s = s.replace(re, '').trim();
    }
    return s;
  }

  private async resolveProjectIdOrName(
    projectIdOrName: string,
    userId: string,
    userRole: Role,
  ): Promise<{ error?: string; projectId?: string }> {
    const raw = (projectIdOrName || '').trim();
    if (!raw) return { error: 'Indiquez le nom ou l\'identifiant du projet (ex: projectName: "aa").' };
    const trimmed = this.normalizeProjectIdOrName(raw) || raw;
    if (!trimmed) return { error: 'Indiquez le nom du projet (ex: projectName: "aa").' };
    if (this.isValidObjectId(trimmed)) return { projectId: trimmed };
    const list = await this.projectsService.findAll({ search: trimmed }, userId, userRole);
    const exact = list.find((p: any) => p.name && String(p.name).toLowerCase() === trimmed.toLowerCase());
    const candidate = exact ?? list[0];
    const idStr = candidate ? (candidate._id?.toString?.() ?? (candidate as any).id?.toString?.()) : null;
    if (idStr && this.isValidObjectId(idStr)) return { projectId: idStr };
    if (list.length === 0) return { error: `Aucun projet trouvé pour "${trimmed}". Utilisez "list_projects" avec search pour voir les projets disponibles.` };
    return { error: `Plusieurs projets correspondent à "${trimmed}". Soyez plus précis (ex: "${list[0].name}").` };
  }

  private async resolveTaskIdByProjectAndTitle(
    projectIdOrName: string,
    taskTitle: string,
    userId: string,
    userRole: Role,
  ): Promise<{ error?: string; taskId?: string }> {
    const resolved = await this.resolveProjectIdOrName(projectIdOrName, userId, userRole);
    if (resolved.error || !resolved.projectId) return { error: resolved.error };
    const list = await this.tasksService.findAll({ projectId: resolved.projectId });
    const titleTrim = (taskTitle || '').trim().toLowerCase();
    const exact = list.find((t: any) => t.title && String(t.title).toLowerCase() === titleTrim);
    const candidate = exact ?? list.find((t: any) => t.title && String(t.title).toLowerCase().includes(titleTrim));
    if (candidate) return { taskId: (candidate._id || (candidate as any).id)?.toString() };
    if (list.length === 0) return { error: 'Aucune tâche dans ce projet.' };
    return { error: `Aucune tâche trouvée avec le titre "${taskTitle}" dans ce projet.` };
  }

  private async executeTool(
    name: string,
    args: Record<string, any>,
    userId: string,
    userRole: Role,
  ): Promise<string> {
    const adminOrChefOnly = [Role.ADMIN, Role.CHEF_PROJET].includes(userRole);
    const consultantBlocked =
      'Désolé, vous n\'avez pas les droits nécessaires pour cette action. Seuls les administrateurs et chefs de projet peuvent créer, modifier ou clôturer des projets.';

    try {
      switch (name) {
        case 'list_users': {
          if (!adminOrChefOnly) {
            return this.serialize({ error: consultantBlocked });
          }
          const all = await this.usersService.findAll();
          let filtered = all;
          if (args.role) {
            filtered = all.filter((u: any) => u.role === args.role);
          }
          const users = filtered.map((u: any) => ({
            nom: u.nom,
            prenom: u.prenom,
            role: u.role,
            _id: u._id?.toString(),
          }));
          return this.serialize({ count: users.length, users });
        }
        case 'list_projects': {
          const query: any = {};
          if (args.status) query.status = args.status;
          if (args.search) query.search = args.search;
          const list = await this.projectsService.findAll(query, userId, userRole);
          return this.serialize({ count: list.length, projects: list });
        }
        case 'get_project': {
          const resolved = await this.resolveProjectIdOrName(args.projectId || args.projectName, userId, userRole);
          if (resolved.error) return this.serialize({ error: resolved.error });
          const project = await this.projectsService.findOne(resolved.projectId!, userId, userRole);
          return this.serialize(project);
        }
        case 'create_project': {
          if (!adminOrChefOnly) {
            return this.serialize({ error: consultantBlocked });
          }
          let managerId: string;
          if (userRole === Role.ADMIN) {
            const managerName = args.managerName?.trim();
            if (!managerName) {
              return this.serialize({ error: 'En tant qu\'administrateur, veuillez indiquer le nom du chef de projet (ex: Jean Dupont).' });
            }
            const manager = await this.usersService.findManagerByName(managerName);
            if (!manager) {
              return this.serialize({ error: `Aucun chef de projet trouvé pour "${managerName}". Vérifiez le nom ou utilisez list_users pour voir les disponibles.` });
            }
            managerId = (manager as any)._id.toString();
          } else {
            managerId = userId;
          }
          const createDto: any = { name: args.name, managerId };
          if (args.description) createDto.description = args.description;
          if (args.endDate) createDto.endDate = new Date(args.endDate);
          if (args.memberNames && typeof args.memberNames === 'string') {
            const names = args.memberNames.split(',').map((s: string) => s.trim()).filter(Boolean);
            const members: string[] = [];
            for (const n of names) {
              const u = await this.usersService.findUserByName(n);
              if (u) members.push((u as any)._id.toString());
            }
            createDto.members = members;
          } else if (args.memberIds && typeof args.memberIds === 'string') {
            createDto.members = args.memberIds.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          const project = await this.projectsService.create(createDto, userId);
          return this.serialize({ created: true, project });
        }
        case 'update_project': {
          if (!adminOrChefOnly) {
            return this.serialize({ error: consultantBlocked });
          }
          const resolved = await this.resolveProjectIdOrName(args.projectId || args.projectName, userId, userRole);
          if (resolved.error) return this.serialize({ error: resolved.error });
          const updateDto: any = {};
          if (args.name !== undefined) updateDto.name = args.name;
          if (args.description !== undefined) updateDto.description = args.description;
          if (args.status) updateDto.status = args.status as ProjectStatus;
          if (args.endDate) updateDto.endDate = new Date(args.endDate);
          if (args.memberIds !== undefined && typeof args.memberIds === 'string') {
            updateDto.members = args.memberIds.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          const project = await this.projectsService.update(resolved.projectId!, updateDto, userId, userRole);
          return this.serialize({ updated: true, project });
        }
        case 'close_project': {
          if (!adminOrChefOnly) {
            return this.serialize({ error: consultantBlocked });
          }
          const resolved = await this.resolveProjectIdOrName(args.projectId || args.projectName, userId, userRole);
          if (resolved.error) return this.serialize({ error: resolved.error });
          const project = await this.projectsService.close(resolved.projectId!, userId, userRole);
          return this.serialize({ closed: true, project });
        }
        case 'delete_project': {
          if (!adminOrChefOnly) {
            return this.serialize({ error: consultantBlocked });
          }
          const resolved = await this.resolveProjectIdOrName(args.projectId || args.projectName, userId, userRole);
          if (resolved.error) return this.serialize({ error: resolved.error });
          if (!resolved.projectId || !this.isValidObjectId(resolved.projectId)) {
            return this.serialize({ error: 'Identifiant du projet invalide. Vérifiez le nom du projet et réessayez.' });
          }
          await this.projectsService.remove(resolved.projectId, userId, userRole);
          return this.serialize({ deleted: true, message: 'Projet supprimé avec succès' });
        }
        case 'list_tasks': {
          const resolved = await this.resolveProjectIdOrName(args.projectId || args.projectName, userId, userRole);
          if (resolved.error) return this.serialize({ error: resolved.error });
          const query: any = { projectId: resolved.projectId };
          if (args.status) query.status = args.status;
          const list = await this.tasksService.findAll(query);
          return this.serialize({ count: list.length, tasks: list });
        }
        case 'get_task': {
          const task = await this.tasksService.findOne(args.taskId);
          return this.serialize(task);
        }
        case 'create_task': {
          if (!adminOrChefOnly) {
            return this.serialize({
              error:
                'Désolé, vous n\'avez pas les droits nécessaires. Seuls les administrateurs et chefs de projet peuvent créer des tâches.',
            });
          }
          const resolved = await this.resolveProjectIdOrName(args.projectId || args.projectName, userId, userRole);
          if (resolved.error) return this.serialize({ error: resolved.error });
          const createDto: any = {
            projectId: resolved.projectId,
            title: args.title,
          };
          if (args.description) createDto.description = args.description;
          if (args.status) createDto.status = args.status;
          if (args.priority) createDto.priority = args.priority;
          if (args.dueDate) createDto.dueDate = args.dueDate;
          if (args.assigneeId) createDto.assigneeId = args.assigneeId;
          const task = await this.tasksService.create(createDto);
          return this.serialize({ created: true, task });
        }
        case 'update_task': {
          if (!adminOrChefOnly) {
            return this.serialize({
              error:
                'Désolé, vous n\'avez pas les droits nécessaires. Seuls les administrateurs et chefs de projet peuvent modifier des tâches.',
            });
          }
          const updateDto: any = {};
          if (args.title !== undefined) updateDto.title = args.title;
          if (args.description !== undefined) updateDto.description = args.description;
          if (args.status) updateDto.status = args.status;
          if (args.priority) updateDto.priority = args.priority;
          if (args.dueDate !== undefined) updateDto.dueDate = args.dueDate;
          if (args.assigneeId !== undefined) updateDto.assigneeId = args.assigneeId;
          const task = await this.tasksService.update(args.taskId, updateDto);
          return this.serialize({ updated: true, task });
        }
        case 'update_all_tasks_status': {
          if (!adminOrChefOnly) {
            return this.serialize({
              error:
                'Désolé, vous n\'avez pas les droits nécessaires. Seuls les administrateurs et chefs de projet peuvent modifier les tâches.',
            });
          }
          const resolved = await this.resolveProjectIdOrName(args.projectId || args.projectName, userId, userRole);
          if (resolved.error) return this.serialize({ error: resolved.error });
          if (!resolved.projectId || !this.isValidObjectId(resolved.projectId)) {
            return this.serialize({ error: 'Identifiant du projet invalide.' });
          }
          const status = (args.status as string) || 'DONE';
          const result = await this.tasksService.updateAllByProject(resolved.projectId, status);
          return this.serialize({ updated: result.count, message: `${result.count} tâche(s) passée(s) en ${status}.` });
        }
        case 'delete_task': {
          if (!adminOrChefOnly) {
            return this.serialize({
              error:
                'Désolé, vous n\'avez pas les droits nécessaires. Seuls les administrateurs et chefs de projet peuvent supprimer des tâches.',
            });
          }
          let taskId: string | undefined = args.taskId?.trim();
          if (!taskId && (args.projectId || args.projectName) && args.taskTitle) {
            const resolvedTask = await this.resolveTaskIdByProjectAndTitle(
              args.projectId || args.projectName,
              args.taskTitle,
              userId,
              userRole,
            );
            if (resolvedTask.error) return this.serialize({ error: resolvedTask.error });
            taskId = resolvedTask.taskId;
          }
          if (!taskId) {
            return this.serialize({ error: 'Indiquez le taskId ou le nom du projet et le titre de la tâche (projectName, taskTitle).' });
          }
          await this.tasksService.remove(taskId);
          return this.serialize({ deleted: true, taskId });
        }
        default:
          return this.serialize({ error: `Unknown tool: ${name}` });
      }
    } catch (err: any) {
      const message = err?.message || err?.response?.message || String(err);
      return this.serialize({ error: message });
    }
  }

  async getConversation(userId: string): Promise<{ messages: BotMessage[] }> {
    const messages = await this.conversationService.getMessages(userId);
    return { messages };
  }

  async chat(dto: BotChatDto, userId: string, userRole: Role): Promise<{ reply: string }> {
    if (!this.groq) {
      return {
        reply:
          'TILIBOT est désactivé : clé API Groq (GROQ_API_KEY) non configurée. Configurez-la dans le fichier .env du backend.',
      };
    }

    let roleHint = '';
    if (userRole === Role.CONSULTANT) {
      roleHint = " L'utilisateur est un CONSULTANT : il ne peut QUE consulter (lister projets, voir détails, lister tâches). S'il demande de créer/modifier/clôturer un projet ou de créer/modifier/supprimer une tâche, réponds poliment qu'il n'a pas les droits et suggère de contacter un administrateur ou chef de projet.";
    } else if (userRole === Role.ADMIN) {
      roleHint = " L'utilisateur est ADMIN : pour créer un projet, il doit indiquer le nom du chef de projet (managerName) et les noms des membres (memberNames). Utilise list_users si besoin pour voir les noms.";
    } else {
      roleHint = " L'utilisateur est CHEF DE PROJET : pour créer un projet, il n'a pas besoin d'indiquer de chef (le projet lui est assigné). Indique uniquement le nom du projet et les noms des membres (memberNames).";
    }
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT + roleHint },
    ];

    if (dto.history && dto.history.length > 0) {
      const lastHistory = dto.history.slice(-12);
      for (const m of lastHistory) {
        if (m.role === 'user' || m.role === 'assistant') {
          messages.push({ role: m.role, content: m.content });
        }
      }
    }

    messages.push({ role: 'user', content: dto.message });

    const consultantReadOnlyTools = ['list_projects', 'get_project', 'list_tasks', 'get_task'];
    const enabledTools =
      userRole === Role.CONSULTANT
        ? TILI_TOOLS.filter((t) => consultantReadOnlyTools.includes(t.function.name))
        : TILI_TOOLS;

    let round = 0;
    let lastMessage: Groq.Chat.ChatCompletionMessageParam = { role: 'user', content: dto.message };

    while (round < this.maxToolRounds) {
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages,
        tools: enabledTools as any,
        tool_choice: 'auto',
        max_tokens: 2048,
        temperature: 0.3,
      });

      const choice = completion.choices[0];
      if (!choice?.message) {
        const reply = "Désolé, je n'ai pas pu générer une réponse.";
        await this.saveMessages(userId, [
          { role: 'user', content: dto.message },
          { role: 'assistant', content: reply },
        ]);
        return { reply };
      }

      lastMessage = choice.message as Groq.Chat.ChatCompletionMessageParam;
      messages.push(lastMessage);

      const toolCalls = (lastMessage as any).tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        const content = (lastMessage as any).content?.trim();
        const reply = content || "C'est fait. Souhaitez-vous autre chose ?";
        await this.saveMessages(userId, [
          { role: 'user', content: dto.message },
          { role: 'assistant', content: reply },
        ]);
        return { reply };
      }

      for (const tc of toolCalls) {
        const fn = (tc as any).function;
        const name = fn?.name;
        let args: Record<string, any> = {};
        try {
          if (typeof fn?.arguments === 'string') {
            args = JSON.parse(fn.arguments);
          }
        } catch {
          args = {};
        }
        const result = await this.executeTool(name, args, userId, userRole);
        messages.push({
          role: 'tool',
          content: result,
          tool_call_id: (tc as any).id,
          name,
        } as any);
      }

      round++;
    }

    const finalContent = (lastMessage as any).content?.trim();
    const reply = finalContent || "J'ai effectué les actions demandées. Consultez l'application pour voir les changements.";
    await this.saveMessages(userId, [
      { role: 'user', content: dto.message },
      { role: 'assistant', content: reply },
    ]);
    return { reply };
  }
}
