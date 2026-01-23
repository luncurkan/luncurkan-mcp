/**
 * Quota-related MCP tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { LuncurkanClient } from '../client.js';

export const quotaTools: Tool[] = [
  {
    name: 'get_quota',
    description:
      'Get your current quota limits and usage. Shows CPU and memory limits, current usage, and remaining resources.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

export async function handleQuotaTool(
  client: LuncurkanClient,
  name: string,
  _args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'get_quota': {
      const quota = await client.getQuota();

      // Calculate percentages
      const cpuUsagePercent =
        quota.userLimits.service_cpu > 0
          ? Math.round(
              (quota.userUsage.used_service_cpu /
                quota.userLimits.service_cpu) *
                100
            )
          : 0;
      const memoryUsagePercent =
        quota.userLimits.service_memory_mb > 0
          ? Math.round(
              (quota.userUsage.used_service_memory_mb /
                quota.userLimits.service_memory_mb) *
                100
            )
          : 0;

      return {
        limits: {
          cpu: `${quota.userLimits.service_cpu}m`,
          memory: `${quota.userLimits.service_memory_mb} MiB`,
        },
        usage: {
          cpu: `${quota.userUsage.used_service_cpu}m (${cpuUsagePercent}%)`,
          memory: `${quota.userUsage.used_service_memory_mb} MiB (${memoryUsagePercent}%)`,
        },
        remaining: {
          cpu: `${quota.userRemaining.service_cpu}m`,
          memory: `${quota.userRemaining.service_memory_mb} MiB`,
        },
        per_deployment_max: {
          cpu: `${quota.effectiveRemaining.service_cpu}m`,
          memory: `${quota.effectiveRemaining.service_memory_mb} MiB`,
        },
      };
    }

    default:
      throw new Error(`Unknown quota tool: ${name}`);
  }
}
