# @luncurkan/mcp

[![npm version](https://img.shields.io/npm/v/@luncurkan/mcp.svg)](https://www.npmjs.com/package/@luncurkan/mcp)
[![npm downloads](https://img.shields.io/npm/dm/@luncurkan/mcp.svg)](https://www.npmjs.com/package/@luncurkan/mcp)

MCP server for [luncurkan.dev](https://luncurkan.dev) - Deploy and manage applications with AI.

## Installation

```bash
npx @luncurkan/mcp
```

## Setup

1. Get your API token from [console.luncurkan.dev/profile/api-tokens](https://console.luncurkan.dev/profile/api-tokens)

2. Add to your MCP config:

**Claude Code** (`~/.claude/mcp.json`):
```json
{
  "mcpServers": {
    "luncurkan": {
      "command": "npx",
      "args": ["@luncurkan/mcp"],
      "env": {
        "LUNCURKAN_TOKEN": "lnk_your_token_here"
      }
    }
  }
}
```

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "luncurkan": {
      "command": "npx",
      "args": ["@luncurkan/mcp"],
      "env": {
        "LUNCURKAN_TOKEN": "lnk_your_token_here"
      }
    }
  }
}
```

## Tools

| Category | Tools |
|----------|-------|
| **Projects** | `list_projects`, `get_project`, `create_project`, `delete_project` |
| **Templates** | `list_templates`, `create_project_from_template` |
| **Deployments** | `list_deployments`, `get_deployment`, `create_deployment`, `redeploy`, `get_deployment_logs`, `delete_deployment` |
| **Testing** | `test_endpoint`, `test_health`, `test_auth_register`, `test_auth_login` |
| **Organizations** | `list_organizations`, `get_organization`, `list_organization_members` |
| **GitHub** | `list_installations`, `list_installation_repos` |
| **Quota** | `get_quota` |

## Usage

```
"List my projects"
"Deploy my-app"
"Show deployment logs"
"Test the health endpoint"
"Create project from go-fiber-auth template"
```

## Configuration

Add `luncurkan.json` to your repo:

```json
{
  "builder": {
    "lang": "node",
    "version": "20",
    "command": "npm start"
  },
  "resources": {
    "cpu": 100,
    "memory": 256
  }
}
```

Supported languages: `node`, `bun`, `go`, `rust`, `python`

Full docs: [luncurkan.dev/docs](https://luncurkan.dev/docs)

## License

MIT
