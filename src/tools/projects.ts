/**
 * Project-related MCP tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { LuncurkanClient } from '../client.js';

export const projectTools: Tool[] = [
  {
    name: 'list_projects',
    description:
      'List all projects in your account or a specific organization. Returns project names, IDs, and basic info.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        organization_slug: {
          type: 'string',
          description:
            'Optional organization slug to filter projects. If not provided, lists personal projects.',
        },
      },
    },
  },
  {
    name: 'get_project',
    description:
      'Get detailed information about a specific project including its configuration, GitHub repo, and language.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID or slug',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'list_installations',
    description:
      'List all GitHub App installations for your account. Returns installation IDs needed to create projects from GitHub repos.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_installation_repos',
    description:
      'List all repositories accessible via a GitHub App installation. Use this to find repo details needed to create a project.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        installation_id: {
          type: 'number',
          description:
            'The GitHub App installation ID (from list_installations)',
        },
      },
      required: ['installation_id'],
    },
  },
  {
    name: 'create_project',
    description:
      'Create a new project from a GitHub repository. Requires GitHub App installation. Use list_installations and list_installation_repos first to get required IDs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Project name',
        },
        description: {
          type: 'string',
          description: 'Optional project description',
        },
        installation_id: {
          type: 'number',
          description: 'GitHub App installation ID (from list_installations)',
        },
        github_repo_id: {
          type: 'number',
          description: 'GitHub repository ID (from list_installation_repos)',
        },
        github_repo_full_name: {
          type: 'string',
          description:
            'Full repo name e.g., "owner/repo" (from list_installation_repos)',
        },
        github_repo_url: {
          type: 'string',
          description: 'GitHub repository URL (from list_installation_repos)',
        },
        github_default_branch: {
          type: 'string',
          description: 'Default branch name, defaults to "main"',
        },
      },
      required: [
        'name',
        'installation_id',
        'github_repo_id',
        'github_repo_full_name',
      ],
    },
  },
  {
    name: 'delete_project',
    description:
      'Delete a project. This will also delete all deployments associated with the project. This action cannot be undone.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to delete',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'list_templates',
    description:
      'List available project templates. Templates are pre-configured starters for Node.js, Go, Python, Rust, Bun, and more. Use this before create_project_from_template.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          description: 'Filter by category (e.g., "api", "websocket", "auth")',
        },
        language: {
          type: 'string',
          description:
            'Filter by language (e.g., "go", "nodejs", "python", "rust", "bun")',
        },
        search: {
          type: 'string',
          description: 'Search templates by name or description',
        },
      },
    },
  },
  {
    name: 'create_project_from_template',
    description:
      'Create a new project from a template. This clones the template to your GitHub account and creates a project. Use list_templates first to see available templates and list_installations to get your installation_id.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Project name (will also be the GitHub repo name)',
        },
        template_slug: {
          type: 'string',
          description:
            'Template slug from list_templates (e.g., "go-fiber-auth", "bun-elysia-rest-api")',
        },
        installation_id: {
          type: 'number',
          description: 'GitHub App installation ID (from list_installations)',
        },
        description: {
          type: 'string',
          description: 'Optional project description',
        },
      },
      required: ['name', 'template_slug', 'installation_id'],
    },
  },
];

export async function handleProjectTool(
  client: LuncurkanClient,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_projects': {
      const organizationSlug = args['organization_slug'] as string | undefined;
      const projects = await client.listProjects(organizationSlug);
      return {
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          github_repo: p.github_repo_full_name ?? null,
          language: p.language,
          created_at: p.created_at,
        })),
        count: projects.length,
      };
    }

    case 'get_project': {
      const projectId = args['project_id'] as string;
      const project = await client.getProject(projectId);
      return project;
    }

    case 'list_installations': {
      const installations = await client.listInstallations();
      return {
        installations: installations.map((i) => ({
          installation_id: i.installation_id,
          account_login: i.account_login,
          account_type: i.account_type,
        })),
        count: installations.length,
      };
    }

    case 'list_installation_repos': {
      const installationId = args['installation_id'] as number;
      const repos = await client.listInstallationRepos(installationId);
      return {
        repositories: repos.map((r) => ({
          id: r.id,
          name: r.name,
          full_name: r.full_name,
          html_url: r.html_url,
          default_branch: r.default_branch,
          language: r.language,
          private: r.private,
        })),
        count: repos.length,
      };
    }

    case 'create_project': {
      const project = await client.createProject({
        name: args['name'] as string,
        description: args['description'] as string | undefined,
        installation_id: args['installation_id'] as number,
        github_repo_id: args['github_repo_id'] as number,
        github_repo_full_name: args['github_repo_full_name'] as string,
        github_repo_url: args['github_repo_url'] as string | undefined,
        github_default_branch:
          (args['github_default_branch'] as string) || 'main',
      });
      return {
        message: `Project "${project.name}" created successfully`,
        project,
      };
    }

    case 'delete_project': {
      const projectId = args['project_id'] as string;
      await client.deleteProject(projectId);
      return {
        message: `Project ${projectId} deleted successfully`,
      };
    }

    case 'list_templates': {
      const templates = await client.listTemplates({
        category: args['category'] as string | undefined,
        language: args['language'] as string | undefined,
        search: args['search'] as string | undefined,
      });
      return {
        templates: templates.map((t) => ({
          slug: t.slug,
          name: t.name,
          description: t.description,
          language: t.language,
          category: t.category,
          tags: t.tags,
        })),
        count: templates.length,
      };
    }

    case 'create_project_from_template': {
      const project = await client.createProjectFromTemplate({
        name: args['name'] as string,
        template_slug: args['template_slug'] as string,
        installation_id: args['installation_id'] as number,
        description: args['description'] as string | undefined,
      });
      return {
        message: `Project "${project.name}" created from template successfully`,
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
          github_repo: project.github_repo_full_name,
          language: project.detected_language || project.language,
        },
      };
    }

    default:
      throw new Error(`Unknown project tool: ${name}`);
  }
}
