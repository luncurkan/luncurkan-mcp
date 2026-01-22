/**
 * Testing tools for deployed endpoints
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { LuncurkanClient } from '../client.js';
import { makeRequest, isSuccess } from '../utils/index.js';

export const testingTools: Tool[] = [
  {
    name: 'test_endpoint',
    description:
      'Test a deployment endpoint by making an HTTP request. Supports GET, POST, PUT, DELETE methods.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description:
            'Full URL to test (e.g., https://my-app.luncurkan.app/api/users)',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          description: 'HTTP method (default: GET)',
        },
        body: {
          type: 'object',
          description:
            'Request body for POST/PUT/PATCH requests (as JSON object)',
          additionalProperties: true,
        },
        headers: {
          type: 'object',
          description:
            'Custom headers (e.g., {"Authorization": "Bearer token"})',
          additionalProperties: { type: 'string' },
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'test_health',
    description:
      'Quick health check for a deployment. Tests the /health endpoint and returns status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deployment_id: {
          type: 'string',
          description: 'The deployment ID to check health for',
        },
        custom_path: {
          type: 'string',
          description: 'Custom health path (default: /health)',
        },
      },
      required: ['deployment_id'],
    },
  },
  {
    name: 'test_auth_register',
    description:
      'Test user registration on an auth service. Posts to /api/auth/register endpoint.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deployment_id: {
          type: 'string',
          description: 'The deployment ID of the auth service',
        },
        email: {
          type: 'string',
          description: 'User email to register',
        },
        password: {
          type: 'string',
          description: 'User password',
        },
        custom_path: {
          type: 'string',
          description: 'Custom register path (default: /api/auth/register)',
        },
      },
      required: ['deployment_id', 'email', 'password'],
    },
  },
  {
    name: 'test_auth_login',
    description:
      'Test user login on an auth service. Posts to /api/auth/login endpoint.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deployment_id: {
          type: 'string',
          description: 'The deployment ID of the auth service',
        },
        email: {
          type: 'string',
          description: 'User email to login',
        },
        password: {
          type: 'string',
          description: 'User password',
        },
        custom_path: {
          type: 'string',
          description: 'Custom login path (default: /api/auth/login)',
        },
      },
      required: ['deployment_id', 'email', 'password'],
    },
  },
];

/**
 * Get base URL from deployment
 */
function getDeploymentUrl(deployment: {
  deployed_url?: string;
  endpoints?: { external_url?: string; domains?: string[] };
}): string | null {
  return (
    deployment.deployed_url ||
    deployment.endpoints?.external_url ||
    (deployment.endpoints?.domains?.[0]
      ? `https://${deployment.endpoints.domains[0]}`
      : null)
  );
}

export async function handleTestingTool(
  client: LuncurkanClient,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'test_endpoint': {
      const url = args['url'] as string;
      const method =
        (args['method'] as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') ||
        'GET';
      const body = args['body'] as Record<string, unknown> | undefined;
      const headers = args['headers'] as Record<string, string> | undefined;

      try {
        const response = await makeRequest(url, { method, body, headers });
        return {
          success: isSuccess(response),
          request: { url, method, body: body || null },
          response,
        };
      } catch (error) {
        return {
          success: false,
          request: { url, method, body: body || null },
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    case 'test_health': {
      const deploymentId = args['deployment_id'] as string;
      const customPath = (args['custom_path'] as string) || '/health';

      const deployment = await client.getDeployment(deploymentId);
      const baseUrl = getDeploymentUrl(deployment);

      if (!baseUrl) {
        return {
          success: false,
          error: 'Deployment has no accessible URL',
          deployment_status: deployment.status,
          deployment_phase: deployment.phase,
        };
      }

      const healthUrl = `${baseUrl}${customPath}`;

      try {
        const response = await makeRequest(healthUrl);
        return {
          success: response.status === 200,
          url: healthUrl,
          response,
          deployment: {
            id: deployment.id,
            status: deployment.status,
            phase: deployment.phase,
          },
        };
      } catch (error) {
        return {
          success: false,
          url: healthUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          deployment: {
            id: deployment.id,
            status: deployment.status,
            phase: deployment.phase,
          },
        };
      }
    }

    case 'test_auth_register': {
      const deploymentId = args['deployment_id'] as string;
      const email = args['email'] as string;
      const password = args['password'] as string;
      const customPath =
        (args['custom_path'] as string) || '/api/auth/register';

      const deployment = await client.getDeployment(deploymentId);
      const baseUrl = getDeploymentUrl(deployment);

      if (!baseUrl) {
        return { success: false, error: 'Deployment has no accessible URL' };
      }

      const registerUrl = `${baseUrl}${customPath}`;

      try {
        const response = await makeRequest(registerUrl, {
          method: 'POST',
          body: { email, password },
        });
        return { success: isSuccess(response), url: registerUrl, response };
      } catch (error) {
        return {
          success: false,
          url: registerUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    case 'test_auth_login': {
      const deploymentId = args['deployment_id'] as string;
      const email = args['email'] as string;
      const password = args['password'] as string;
      const customPath = (args['custom_path'] as string) || '/api/auth/login';

      const deployment = await client.getDeployment(deploymentId);
      const baseUrl = getDeploymentUrl(deployment);

      if (!baseUrl) {
        return { success: false, error: 'Deployment has no accessible URL' };
      }

      const loginUrl = `${baseUrl}${customPath}`;

      try {
        const response = await makeRequest(loginUrl, {
          method: 'POST',
          body: { email, password },
        });
        return { success: isSuccess(response), url: loginUrl, response };
      } catch (error) {
        return {
          success: false,
          url: loginUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    default:
      throw new Error(`Unknown testing tool: ${name}`);
  }
}
