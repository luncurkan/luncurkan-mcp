/**
 * Luncurkan API Client
 */

import type {
  ApiResponse,
  CreateDeploymentInput,
  CreateProjectInput,
  CreateProjectFromTemplateInput,
  Deployment,
  GitHubRepository,
  GitHubTemplate,
  Installation,
  LuncurkanConfig,
  Organization,
  OrganizationMember,
  Project,
  User,
} from './types.js';

const DEFAULT_BASE_URL = 'https://workers.luncurkan.dev';

export class LuncurkanClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string, baseUrl?: string) {
    this.token = token;
    this.baseUrl = baseUrl ?? DEFAULT_BASE_URL;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => ({}))) as ApiResponse<unknown>;
      throw new Error(
        error.error ?? error.message ?? `HTTP ${response.status}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * @section Auth
   * Authentication and user methods
   */

  /** Get the current authenticated user */
  async getMe(): Promise<User> {
    return this.request<User>('GET', '/auth/me');
  }

  /**
   * @section Projects
   * Project management methods
   */

  /** List all projects, optionally filtered by organization */
  async listProjects(organizationSlug?: string): Promise<Project[]> {
    const path = organizationSlug
      ? `/api/organizations/${organizationSlug}/projects`
      : '/api/projects';
    const response = await this.request<{ projects: Project[] }>('GET', path);
    return response.projects;
  }

  /** Get a project by ID */
  async getProject(projectId: string): Promise<Project> {
    const response = await this.request<{ project: Project }>(
      'GET',
      `/api/projects/${projectId}`
    );
    return response.project;
  }

  /** Create a new project from a GitHub repository */
  async createProject(input: CreateProjectInput): Promise<Project> {
    const response = await this.request<{ project: Project }>(
      'POST',
      '/api/projects/github',
      input
    );
    return response.project;
  }

  /**
   * @section GitHub Installations
   * GitHub App installation methods
   */

  /** List all GitHub App installations */
  async listInstallations(): Promise<Installation[]> {
    const response = await this.request<{ installations: Installation[] }>(
      'GET',
      '/api/installations'
    );
    return response.installations;
  }

  /** List repositories accessible via a GitHub App installation */
  async listInstallationRepos(
    installationId: number
  ): Promise<GitHubRepository[]> {
    const response = await this.request<{ repositories: GitHubRepository[] }>(
      'GET',
      `/api/installations/${installationId}/repos`
    );
    return response.repositories;
  }

  /** Get luncurkan.json config from a repository */
  async getRepoConfig(
    installationId: number,
    owner: string,
    repo: string,
    ref?: string
  ): Promise<LuncurkanConfig | null> {
    const path = `/api/installations/${installationId}/repos/${owner}/${repo}/config${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
    const response = await this.request<{ config: LuncurkanConfig | null }>(
      'GET',
      path
    );
    return response.config;
  }

  /** Delete a project and all its deployments */
  async deleteProject(projectId: string): Promise<void> {
    await this.request<void>('DELETE', `/api/projects/${projectId}`);
  }

  /**
   * @section Templates
   * Project template methods
   */

  /** List available project templates with optional filters */
  async listTemplates(filters?: {
    category?: string;
    language?: string;
    search?: string;
  }): Promise<GitHubTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.language) params.append('language', filters.language);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const path = `/api/templates/github${queryString ? `?${queryString}` : ''}`;
    const response = await this.request<{ templates: GitHubTemplate[] }>(
      'GET',
      path
    );
    return response.templates;
  }

  /** Create a new project from a template */
  async createProjectFromTemplate(
    input: CreateProjectFromTemplateInput
  ): Promise<Project> {
    const response = await this.request<{ project: Project }>(
      'POST',
      '/api/projects/template',
      input
    );
    return response.project;
  }

  /**
   * @section Deployments
   * Deployment management methods
   */

  /** List all deployments for a project */
  async listDeployments(projectId: string): Promise<Deployment[]> {
    const response = await this.request<{ deployments: Deployment[] }>(
      'GET',
      `/api/projects/${projectId}/deployments`
    );
    return response.deployments;
  }

  /** Get deployment details by ID */
  async getDeployment(deploymentId: string): Promise<Deployment> {
    const response = await this.request<{ deployment: Deployment }>(
      'GET',
      `/api/deployments/${deploymentId}`
    );
    return response.deployment;
  }

  /** Create a new deployment for a project */
  async createDeployment(input: CreateDeploymentInput): Promise<Deployment> {
    const response = await this.request<{ deployment: Deployment }>(
      'POST',
      `/api/projects/${input.project_id}/deployments`,
      input
    );
    return response.deployment;
  }

  /** Redeploy an existing deployment */
  async redeploy(deploymentId: string): Promise<Deployment> {
    const response = await this.request<{ deployment: Deployment }>(
      'POST',
      `/api/deployments/${deploymentId}/redeploy`
    );
    return response.deployment;
  }

  /** Get deployment logs */
  async getDeploymentLogs(deploymentId: string): Promise<string> {
    const response = await this.request<{ logs: string }>(
      'GET',
      `/api/deployments/${deploymentId}/logs`
    );
    return response.logs;
  }

  /** Delete a deployment */
  async deleteDeployment(deploymentId: string): Promise<void> {
    await this.request<void>('DELETE', `/api/deployments/${deploymentId}`);
  }

  /**
   * @section Organizations
   * Organization management methods
   */

  /** List all organizations the user is a member of */
  async listOrganizations(): Promise<Organization[]> {
    const response = await this.request<{ organizations: Organization[] }>(
      'GET',
      '/api/organizations'
    );
    return response.organizations;
  }

  /** Get organization details by slug */
  async getOrganization(slug: string): Promise<Organization> {
    const response = await this.request<{ organization: Organization }>(
      'GET',
      `/api/organizations/${slug}`
    );
    return response.organization;
  }

  /** List all members of an organization */
  async listOrganizationMembers(slug: string): Promise<OrganizationMember[]> {
    const response = await this.request<{ members: OrganizationMember[] }>(
      'GET',
      `/api/organizations/${slug}/members`
    );
    return response.members;
  }
}

/**
 * Create a client instance from environment variables
 */
export function createClientFromEnv(): LuncurkanClient {
  const token = process.env['LUNCURKAN_TOKEN'];

  if (!token) {
    throw new Error(
      'LUNCURKAN_TOKEN environment variable is required. ' +
        'Generate a token at https://console.luncurkan.dev/settings/tokens'
    );
  }

  const baseUrl = process.env['LUNCURKAN_API_URL'];

  return new LuncurkanClient(token, baseUrl);
}
