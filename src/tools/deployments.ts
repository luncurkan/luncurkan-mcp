/**
 * Deployment-related MCP tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { LuncurkanClient } from '../client.js';
import type { DeploymentDependency } from '../types.js';
import { generateUUIDv7, generateDomain } from '../utils/index.js';

export const deploymentTools: Tool[] = [
  {
    name: 'list_deployments',
    description:
      'List all deployments for a project. Shows deployment status, branch, commit, and timestamps.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to list deployments for',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_deployment',
    description:
      'Get detailed information about a specific deployment including its configuration and status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deployment_id: {
          type: 'string',
          description: 'The deployment ID',
        },
      },
      required: ['deployment_id'],
    },
  },
  {
    name: 'create_deployment',
    description:
      'Create and trigger a new deployment for a project. Optionally specify branch, build commands, and environment variables.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to deploy',
        },
        name: {
          type: 'string',
          description: 'Deployment name (optional)',
        },
        version: {
          type: 'string',
          description: 'Deployment version (optional)',
        },
        branch: {
          type: 'string',
          description: 'Git branch to deploy (default: main)',
        },
        build_command: {
          type: 'string',
          description: 'Custom build command (e.g., npm run build)',
        },
        start_command: {
          type: 'string',
          description: 'Custom start command (e.g., npm start)',
        },
        environment_variables: {
          type: 'object',
          description:
            'Environment variables as key-value pairs (e.g., {"NODE_ENV": "production"})',
          additionalProperties: { type: 'string' },
        },
        dependencies: {
          type: 'array',
          description:
            'Deployment dependencies. Default: [{"type": "source"}] for source-only deployments',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['source', 'database', 'runtime'],
                description: 'Dependency type',
              },
              managed: {
                type: 'boolean',
                description: 'Whether this is a managed dependency',
              },
              ref: {
                type: 'string',
                description:
                  'Git ref (branch/tag/commit) for source dependencies',
              },
              db_type: {
                type: 'string',
                description:
                  'Database type for database dependencies (e.g., postgres, mysql)',
              },
            },
            required: ['type'],
          },
        },
        resources: {
          type: 'object',
          description:
            'Resource allocation. Default: {"cpu": 250, "memory": 256} (0.25 vCPU, 256 MiB)',
          properties: {
            cpu: {
              type: 'number',
              description: 'CPU in millicores (e.g., 250 = 0.25 vCPU)',
            },
            memory: {
              type: 'number',
              description: 'Memory in MiB (e.g., 256)',
            },
          },
          required: ['cpu', 'memory'],
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'redeploy',
    description:
      'Redeploy an existing deployment. Can optionally adjust resources and dependencies. Useful for retrying failed deployments, updating to latest code, or scaling resources.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deployment_id: {
          type: 'string',
          description: 'The deployment ID to redeploy',
        },
        resources: {
          type: 'object',
          description:
            'Optional resource adjustment (e.g., {"cpu": 100, "memory": 128})',
          properties: {
            cpu: {
              type: 'number',
              description: 'CPU in millicores (e.g., 100 = 0.1 vCPU)',
            },
            memory: {
              type: 'number',
              description: 'Memory in MiB (e.g., 128)',
            },
          },
        },
        branch: {
          type: 'string',
          description:
            'Optional git branch to deploy from (default: current branch)',
        },
        environment_variables: {
          type: 'object',
          description:
            'Optional environment variables to add/update (e.g., {"NODE_ENV": "production", "LOG_LEVEL": "debug"})',
          additionalProperties: { type: 'string' },
        },
      },
      required: ['deployment_id'],
    },
  },
  {
    name: 'get_deployment_logs',
    description:
      'Get the build and runtime logs for a deployment. Useful for debugging failed deployments.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deployment_id: {
          type: 'string',
          description: 'The deployment ID',
        },
      },
      required: ['deployment_id'],
    },
  },
  {
    name: 'delete_deployment',
    description:
      'Delete a deployment. This will stop the running deployment and free up resources. This action cannot be undone.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deployment_id: {
          type: 'string',
          description: 'The deployment ID to delete',
        },
      },
      required: ['deployment_id'],
    },
  },
];

export async function handleDeploymentTool(
  client: LuncurkanClient,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_deployments': {
      const projectId = String(args['project_id']);
      const deployments = await client.listDeployments(projectId);
      return {
        deployments: deployments.map((d) => ({
          id: d.id,
          status: d.status,
          branch: d.branch,
          commit_sha: d.commit_sha?.substring(0, 7),
          commit_message: d.commit_message,
          created_at: d.created_at,
          completed_at: d.completed_at,
        })),
        count: deployments.length,
      };
    }

    case 'get_deployment': {
      const deploymentId = args['deployment_id'] as string;
      const deployment = await client.getDeployment(deploymentId);
      return deployment;
    }

    case 'create_deployment': {
      const projectId = Number(args['project_id']);

      // Fetch project to get GitHub URL for source dependency
      const project = await client.getProject(String(projectId));

      // Try to fetch luncurkan.json config from repository
      let repoConfig = null;
      if (project.installation_id && project.github_repo_full_name) {
        const parts = project.github_repo_full_name.split('/');
        const owner = parts[0];
        const repo = parts[1];
        const branch =
          (args['branch'] as string) || project.github_default_branch || 'main';
        if (owner && repo) {
          try {
            repoConfig = await client.getRepoConfig(
              project.installation_id,
              owner,
              repo,
              branch
            );
          } catch {
            // Config not found or error - continue without it
          }
        }
      }

      // Default resources: minimal allocation (can be overridden by config)
      const defaultResources = { cpu: 250, memory: 256 };
      const configResources = repoConfig?.resources;
      const argsResources = args['resources'] as
        | { cpu: number; memory: number }
        | undefined;
      const resources =
        argsResources ||
        (configResources
          ? {
              cpu: configResources.cpu || defaultResources.cpu,
              memory: configResources.memory || defaultResources.memory,
            }
          : defaultResources);

      // Build dependencies - if not provided, create from config or auto-construct
      let dependencies = args['dependencies'] as
        | DeploymentDependency[]
        | undefined;

      if (!dependencies || dependencies.length === 0) {
        // Use config dependencies if available, otherwise auto-construct
        if (repoConfig?.dependencies && repoConfig.dependencies.length > 0) {
          // Map config dependencies to DeploymentDependency with generated IDs
          dependencies = repoConfig.dependencies.map((dep) => ({
            ...dep,
            id: generateUUIDv7(),
            type: dep.type as DeploymentDependency['type'],
          }));
        } else {
          // Auto-construct dependencies from project metadata
          const branch =
            (args['branch'] as string) ||
            project.github_default_branch ||
            'main';
          const githubUrl =
            project.github_repo_url ||
            (project.github_repo_full_name
              ? `https://github.com/${project.github_repo_full_name}`
              : null);

          dependencies = [];

          // 1. Source dependency
          if (githubUrl) {
            dependencies.push({
              id: generateUUIDv7(),
              type: 'source',
              url: githubUrl,
              ref: branch,
            });
          }

          // 2. Builder dependency with detected language and commands
          if (project.detected_language) {
            dependencies.push({
              id: generateUUIDv7(),
              type: 'builder',
              lang: project.detected_language,
              version: 'latest',
              command:
                repoConfig?.start_command ||
                project.detected_start_command ||
                'npm start',
              root_path: project.root_path || '.',
              env: {
                PORT: '3000',
                HOST: '0.0.0.0',
              },
            });
          }

          // 3. Env dependency for runtime environment variables
          const envVars =
            (args['environment_variables'] as Record<string, string>) ||
            repoConfig?.environment_variables;
          if (envVars && Object.keys(envVars).length > 0) {
            dependencies.push({
              id: generateUUIDv7(),
              type: 'env',
              env: Object.entries(envVars).map(([key, val]) => ({ key, val })),
            });
          }

          // 4. Domain dependency with auto-generated subdomain
          dependencies.push({
            id: generateUUIDv7(),
            type: 'domain',
            urls: [generateDomain()],
          });
        }
      }

      // Generate deployment ID (UUID v7)
      const deploymentId = generateUUIDv7();

      const deployment = await client.createDeployment({
        id: deploymentId,
        project_id: projectId,
        name: args['name'] as string | undefined,
        version: args['version'] as string | undefined,
        branch: args['branch'] as string | undefined,
        build_command:
          repoConfig?.build_command ||
          (args['build_command'] as string | undefined),
        start_command:
          repoConfig?.start_command ||
          (args['start_command'] as string | undefined),
        environment_variables:
          (args['environment_variables'] as Record<string, string>) ||
          repoConfig?.environment_variables,
        dependencies,
        resources,
      });
      return {
        message: `Deployment triggered successfully${repoConfig ? ' (using luncurkan.json config)' : ''}`,
        deployment: {
          id: deployment.id,
          status: deployment.status,
          branch: deployment.branch,
        },
      };
    }

    case 'redeploy': {
      const deploymentId = args['deployment_id'] as string;
      const resources = args['resources'] as
        | { cpu: number; memory: number }
        | undefined;
      const branch = args['branch'] as string | undefined;
      const envVars = args['environment_variables'] as
        | Record<string, string>
        | undefined;

      const options: {
        resources?: { cpu: number; memory: number };
        branch?: string;
        environment_variables?: Record<string, string>;
      } = {};
      if (resources) options.resources = resources;
      if (branch) options.branch = branch;
      if (envVars) options.environment_variables = envVars;

      const result = await client.redeploy(
        deploymentId,
        Object.keys(options).length > 0 ? options : undefined
      );
      return {
        message: result.message || 'Redeployment triggered successfully',
        deployment_id: result.deployment_id,
        stream_url: result.stream_url,
        ...(resources && { resources }),
        ...(branch && { branch }),
        ...(envVars && { environment_variables: envVars }),
      };
    }

    case 'get_deployment_logs': {
      const deploymentId = args['deployment_id'] as string;
      const logs = await client.getDeploymentLogs(deploymentId);
      return {
        deployment_id: deploymentId,
        logs,
      };
    }

    case 'delete_deployment': {
      const deploymentId = args['deployment_id'] as string;
      await client.deleteDeployment(deploymentId);
      return {
        message: 'Deployment deleted successfully',
        deployment_id: deploymentId,
      };
    }

    default:
      throw new Error(`Unknown deployment tool: ${name}`);
  }
}
