/**
 * Organization-related MCP tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { LuncurkanClient } from '../client.js';

export const organizationTools: Tool[] = [
  {
    name: 'list_organizations',
    description:
      'List all organizations you are a member of. Shows organization names, slugs, and your role in each.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_organization',
    description: 'Get detailed information about a specific organization.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        organization_slug: {
          type: 'string',
          description: 'The organization slug',
        },
      },
      required: ['organization_slug'],
    },
  },
  {
    name: 'list_organization_members',
    description:
      'List all members of an organization with their roles (owner, admin, member).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        organization_slug: {
          type: 'string',
          description: 'The organization slug',
        },
      },
      required: ['organization_slug'],
    },
  },
];

export async function handleOrganizationTool(
  client: LuncurkanClient,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_organizations': {
      const organizations = await client.listOrganizations();
      return {
        organizations: organizations.map((o) => ({
          id: o.id,
          name: o.name,
          slug: o.slug,
          created_at: o.created_at,
        })),
        count: organizations.length,
      };
    }

    case 'get_organization': {
      const slug = args['organization_slug'] as string;
      const organization = await client.getOrganization(slug);
      return organization;
    }

    case 'list_organization_members': {
      const slug = args['organization_slug'] as string;
      const members = await client.listOrganizationMembers(slug);
      return {
        members: members.map((m) => ({
          id: m.id,
          role: m.role,
          user: m.user
            ? {
                name: m.user.name,
                email: m.user.email,
              }
            : null,
        })),
        count: members.length,
      };
    }

    default:
      throw new Error(`Unknown organization tool: ${name}`);
  }
}
