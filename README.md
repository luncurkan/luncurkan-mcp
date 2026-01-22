# @luncurkan/mcp

MCP (Model Context Protocol) server for [luncurkan.dev](https://luncurkan.dev) - Deploy and manage your applications with AI.

## Features

- **Project Management** - List, create, and manage projects
- **Templates** - Create projects from pre-configured templates (Go, Node.js, Python, Rust, Bun)
- **Deployments** - Trigger deployments, check status, view logs
- **Testing** - Test deployed endpoints, health checks, and auth flows
- **Organizations** - Manage team workspaces and members
- **GitHub Integration** - Connect repositories via GitHub App installations

## Installation

```bash
npm install -g @luncurkan/mcp
```

Or use directly with npx:

```bash
npx @luncurkan/mcp
```

## Setup

### 1. Generate an API Token

1. Go to [console.luncurkan.dev/settings/tokens](https://console.luncurkan.dev/settings/tokens)
2. Click "Generate New Token"
3. Give it a name (e.g., "Claude Code MCP")
4. Copy the token (you won't see it again!)

### 2. Configure Claude Code

Add to your Claude Code MCP configuration (`~/.claude/mcp.json`):

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

### 3. Configure Claude Desktop

Add to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

## Available Tools

### Projects

| Tool | Description |
|------|-------------|
| `list_projects` | List all projects in your account or organization |
| `get_project` | Get detailed project information |
| `create_project` | Create a new project from a GitHub repository |
| `delete_project` | Delete a project and all its deployments |

### Templates

| Tool | Description |
|------|-------------|
| `list_templates` | List available project templates with optional filters (language, category, search) |
| `create_project_from_template` | Create a new project from a template (clones to your GitHub and creates project) |

**Available template languages**: Go, Node.js, Python, Rust, Bun

### GitHub Installations

| Tool | Description |
|------|-------------|
| `list_installations` | List all GitHub App installations for your account |
| `list_installation_repos` | List repositories accessible via a GitHub App installation |

### Deployments

| Tool | Description |
|------|-------------|
| `list_deployments` | List all deployments for a project |
| `get_deployment` | Get deployment details and status |
| `create_deployment` | Trigger a new deployment with auto-configured dependencies |
| `redeploy` | Redeploy an existing deployment with the same configuration |
| `get_deployment_logs` | Get build and runtime logs for debugging |

**Deployment features**:
- Auto-detects language and build/start commands
- Generates unique subdomains (e.g., `https://keen-hawk-goso.luncurkan.app`)
- Supports `luncurkan.json` config file for custom settings
- UUID v7 for all deployment and dependency IDs

### Testing

| Tool | Description |
|------|-------------|
| `test_endpoint` | Test any deployment endpoint with custom HTTP method, body, and headers |
| `test_health` | Quick health check for a deployment (tests `/health` endpoint) |
| `test_auth_register` | Test user registration on an auth service (`/api/auth/register`) |
| `test_auth_login` | Test user login on an auth service (`/api/auth/login`) |

### Organizations

| Tool | Description |
|------|-------------|
| `list_organizations` | List all organizations you are a member of |
| `get_organization` | Get organization details by slug |
| `list_organization_members` | List all members of an organization with their roles |

## Usage Examples

Once configured, you can ask Claude:

**Projects & Templates**:
- "List all my luncurkan projects"
- "Show me available Go templates"
- "Create a new project from the go-fiber-auth template"
- "Create a project from my GitHub repo owner/repo"

**Deployments**:
- "Deploy my-app to production"
- "What's the status of my latest deployment?"
- "Show me the logs for deployment xyz"
- "Redeploy the failed deployment"

**Testing**:
- "Test the health endpoint of my deployment"
- "Register a test user on my auth service"
- "Make a POST request to my API endpoint"

**Organizations**:
- "List my organizations"
- "Who are the members of my team org?"

## Configuration File

You can add a `luncurkan.json` file to your repository root to configure deployments:

```json
{
  "build_command": "npm run build",
  "start_command": "npm start",
  "resources": {
    "cpu": 250,
    "memory": 256
  },
  "environment_variables": {
    "NODE_ENV": "production"
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LUNCURKAN_TOKEN` | Yes | Your API token from the console |
| `LUNCURKAN_API_URL` | No | Custom API URL (default: https://workers.luncurkan.dev) |

## Project Structure

```
src/
├── index.ts              # MCP server entry point
├── client.ts             # Luncurkan API client
├── types.ts              # TypeScript type definitions
├── tools/
│   ├── projects.ts       # Project & template tools
│   ├── deployments.ts    # Deployment tools
│   ├── organizations.ts  # Organization tools
│   └── testing.ts        # Endpoint testing tools
└── utils/
    ├── index.ts          # Utility exports
    ├── uuid.ts           # UUID v7 generation
    ├── subdomain.ts      # Subdomain/domain generation
    └── http.ts           # HTTP request utilities
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint
```

## License

MIT
