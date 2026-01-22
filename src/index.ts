#!/usr/bin/env node

/**
 * Luncurkan MCP Server
 *
 * MCP server for luncurkan.dev - Deploy and manage your applications with AI
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClientFromEnv, LuncurkanClient } from './client.js';
import {
  projectTools,
  handleProjectTool,
  deploymentTools,
  handleDeploymentTool,
  organizationTools,
  handleOrganizationTool,
  testingTools,
  handleTestingTool,
} from './tools/index.js';

// All available tools
const allTools = [
  ...projectTools,
  ...deploymentTools,
  ...organizationTools,
  ...testingTools,
];

// Tool name to category mapping
const projectToolNames = new Set(projectTools.map((t) => t.name));
const deploymentToolNames = new Set(deploymentTools.map((t) => t.name));
const organizationToolNames = new Set(organizationTools.map((t) => t.name));
const testingToolNames = new Set(testingTools.map((t) => t.name));

/**
 * Handle a tool call by routing to the appropriate handler
 */
async function handleToolCall(
  client: LuncurkanClient,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  if (projectToolNames.has(name)) {
    return handleProjectTool(client, name, args);
  }

  if (deploymentToolNames.has(name)) {
    return handleDeploymentTool(client, name, args);
  }

  if (organizationToolNames.has(name)) {
    return handleOrganizationTool(client, name, args);
  }

  if (testingToolNames.has(name)) {
    return handleTestingTool(client, name, args);
  }

  throw new Error(`Unknown tool: ${name}`);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Create API client from environment
  let client: LuncurkanClient;
  try {
    client = createClientFromEnv();
  } catch {
    console.error(
      'Error: LUNCURKAN_TOKEN environment variable is required.\n' +
        'Generate a token at https://console.luncurkan.dev/profile/api-tokens'
    );
    process.exit(1);
  }

  // Create MCP server
  const server = new Server(
    {
      name: 'luncurkan',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tools/list request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools,
    };
  });

  // Handle tools/call request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleToolCall(
        client,
        name,
        (args ?? {}) as Record<string, unknown>
      );

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: message }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Handle shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
