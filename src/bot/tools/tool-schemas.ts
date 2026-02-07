/**
 * Définitions des outils (function calling) pour TILIBOT.
 * Le modèle Groq utilise ces schémas pour décider quand appeler une fonction.
 */
export const TILI_TOOLS: Array<{
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string; enum?: string[] }>;
      required?: string[];
    };
  };
}> = [
  {
    type: 'function',
    function: {
      name: 'list_projects',
      description: 'CHERCHER ou LISTER les projets (voir la liste, filtrer). À utiliser pour: "chercher projet aa", "liste des projets", "projets contenant X", "voir les projets", "quels projets ont aa". NE JAMAIS utiliser pour supprimer un projet.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Filtrer par statut: ACTIVE, COMPLETED, ARCHIVED' },
          search: { type: 'string', description: 'Recherche par nom (ex: "aa" pour trouver les projets dont le nom contient "aa")' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_project',
      description: 'VOIR LES DÉTAILS d\'un projet par son nom : nom, description, chef de projet (manager), liste des MEMBRES. À utiliser pour: "détails du projet X", "qui sont les membres du projet X", "lister les membres du projet Refonte", "quel est le chef du projet". Donne tout ça, NE SUPPRIME PAS.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Nom du projet (ex: "Refonte Platforme") ou identifiant' },
          projectName: { type: 'string', description: 'Nom du projet (ex: "Refonte Platforme")' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_project',
      description: 'Créer un nouveau projet. Admin : indique managerName (chef de projet) et memberNames (membres). Chef de projet : indique uniquement memberNames, le projet t\'est assigné automatiquement.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nom du projet' },
          description: { type: 'string', description: 'Description optionnelle' },
          managerName: { type: 'string', description: 'Nom du chef de projet (Admin uniquement, ex: Jean Dupont). Utilise list_users pour voir les noms.' },
          memberNames: { type: 'string', description: 'Noms des membres séparés par des virgules (ex: Marie Martin, Pierre Durand)' },
          endDate: { type: 'string', description: 'Date de fin prévue (ISO 8601)' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_users',
      description: 'Lister les utilisateurs (Admin/Chef) pour obtenir les noms lors de la création de projet ou l\'assignation de tâches.',
      parameters: {
        type: 'object',
        properties: {
          role: { type: 'string', description: 'Filtrer par rôle: ADMIN, CHEF_PROJET, CONSULTANT', enum: ['ADMIN', 'CHEF_PROJET', 'CONSULTANT'] },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_project',
      description: 'Modifier un projet existant (nom, description, statut, date de fin, membres)',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Nom du projet (ex: "aa") ou identifiant' },
          projectName: { type: 'string', description: 'Alternative: nom du projet' },
          name: { type: 'string', description: 'Nouveau nom' },
          description: { type: 'string', description: 'Nouvelle description' },
          status: { type: 'string', description: 'ACTIVE, COMPLETED, ARCHIVED', enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'] },
          endDate: { type: 'string', description: 'Date de fin (ISO 8601)' },
          memberIds: { type: 'string', description: 'IDs des membres séparés par des virgules' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'close_project',
      description: 'Clôturer un projet. Accepter le nom du projet (ex: "aa") ou l\'identifiant.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Nom du projet (ex: "aa") ou identifiant' },
          projectName: { type: 'string', description: 'Alternative: nom du projet' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_project',
      description: 'UNIQUEMENT pour SUPPRIMER DÉFINITIVEMENT un projet. À utiliser SEULEMENT quand l\'utilisateur dit explicitement "supprimer", "delete", "remove" (ex: "supprimer projet aa" -> projectName: "aa"). Pour "chercher projet aa", "voir projet aa", "trouver projet aa" -> utiliser get_project ou list_projects, JAMAIS delete_project.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Nom exact du projet (ex: "aa") ou identifiant' },
          projectName: { type: 'string', description: 'Nom exact du projet (ex: "aa") pour "supprimer projet aa"' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_tasks',
      description: 'Lister les tâches d\'un projet. Accepter le nom du projet (ex: "aa") ou l\'identifiant.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Nom du projet (ex: "aa") ou identifiant' },
          projectName: { type: 'string', description: 'Alternative: nom du projet' },
          status: { type: 'string', description: 'TODO, IN_PROGRESS, DONE', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_task',
      description: 'Obtenir les détails d\'une tâche par son ID',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'ID de la tâche' },
        },
        required: ['taskId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Créer une tâche dans un projet. Accepter le nom du projet (ex: "aa") ou l\'identifiant.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Nom du projet (ex: "aa") ou identifiant' },
          projectName: { type: 'string', description: 'Alternative: nom du projet' },
          title: { type: 'string', description: 'Titre de la tâche' },
          description: { type: 'string', description: 'Description optionnelle' },
          status: { type: 'string', description: 'TODO, IN_PROGRESS, DONE', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          priority: { type: 'string', description: 'LOW, MEDIUM, HIGH', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          dueDate: { type: 'string', description: 'Date d\'échéance (ISO 8601)' },
          assigneeId: { type: 'string', description: 'ID de l\'utilisateur assigné' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_task',
      description: 'Modifier une tâche (titre, description, statut, priorité, date, assigné). Utilise list_tasks pour obtenir les taskId si besoin.',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'ID de la tâche' },
          title: { type: 'string', description: 'Nouveau titre' },
          description: { type: 'string', description: 'Nouvelle description' },
          status: { type: 'string', description: 'TODO, IN_PROGRESS, DONE', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          priority: { type: 'string', description: 'LOW, MEDIUM, HIGH', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          dueDate: { type: 'string', description: 'Date d\'échéance (ISO 8601)' },
          assigneeId: { type: 'string', description: 'ID de l\'assigné' },
        },
        required: ['taskId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_all_tasks_status',
      description: 'Mettre à jour le statut de TOUTES les tâches d\'un projet en une fois. À utiliser pour: "marquer toutes les tâches du projet X comme terminées", "passer toutes les tâches de Platforme web en DONE".',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Nom du projet (ex: "Platforme web", "Refonte") ou identifiant' },
          projectName: { type: 'string', description: 'Nom du projet (ex: "Platforme web")' },
          status: { type: 'string', description: 'Nouveau statut pour toutes les tâches (ex: DONE pour terminer)', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
        },
        required: ['status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_task',
      description: 'Supprimer une tâche. Soit par taskId, soit par nom du projet + titre de la tâche (ex: "supprimer tâche ss du projet Refonte" -> projectName: "Refonte Platforme", taskTitle: "ss").',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'ID de la tâche (si connu)' },
          projectId: { type: 'string', description: 'Nom du projet (ex: "Refonte Platforme") ou identifiant' },
          projectName: { type: 'string', description: 'Nom du projet pour "supprimer tâche X du projet Y"' },
          taskTitle: { type: 'string', description: 'Titre exact de la tâche (ex: "ss") pour suppression par nom' },
        },
        required: [],
      },
    },
  },
];
