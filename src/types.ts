/**
 * Luncurkan API Types
 */

export interface User {
  id: string;
  github_id: number;
  name: string;
  email: string;
  avatar_url: string;
  role: 'admin' | 'member';
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  source_type?: string;
  installation_id?: number;
  github_repo_url?: string;
  github_repo_full_name?: string;
  github_default_branch?: string;
  root_path?: string;
  language?: string;
  detected_language?: string;
  detected_build_command?: string;
  detected_start_command?: string;
  created_at: string;
  updated_at: string;
}

export interface DeploymentEndpoints {
  pod_ip?: string;
  service_cluster_ip?: string;
  service_dns?: string;
  external_url?: string;
  domains?: string[];
}

export interface Deployment {
  id: string;
  project_id: string;
  status: DeploymentStatus;
  phase?: string;
  branch?: string;
  commit_sha?: string;
  commit_message?: string;
  build_command?: string;
  start_command?: string;
  environment_variables?: Record<string, string>;
  deployed_url?: string;
  endpoints?: DeploymentEndpoints;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export type DeploymentStatus =
  | 'pending'
  | 'processing'
  | 'processed'
  | 'completed'
  | 'running'
  | 'fail';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'member';
  user?: User;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  installation_id: number;
  github_repo_id: number;
  github_repo_full_name: string;
  github_repo_url?: string;
  github_default_branch?: string;
  organization_id?: number;
}

export interface Installation {
  id: number;
  installation_id: number;
  user_id: number;
  account_login: string;
  account_type: string;
  account_avatar_url: string;
  organization_id?: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description?: string;
  default_branch: string;
  language?: string;
}

export interface DeploymentDependency {
  id: string; // UUID v7
  type: 'source' | 'database' | 'runtime' | 'builder' | 'env' | 'domain';
  managed?: boolean;
  ref?: string;
  db_type?: string;
  url?: string;
  lang?: string;
  version?: string;
  command?: string;
  root_path?: string;
  env?: Record<string, string> | Array<{ key: string; val: string }>;
  urls?: string[];
}

export interface DeploymentResources {
  cpu: number; // millicores (e.g., 250 = 0.25 vCPU)
  memory: number; // MiB (e.g., 256)
}

export interface CreateDeploymentInput {
  id?: string; // UUID v7 for deployment
  project_id: number; // integer
  name?: string;
  version?: string;
  branch?: string;
  build_command?: string;
  start_command?: string;
  environment_variables?: Record<string, string>;
  dependencies: DeploymentDependency[];
  resources: DeploymentResources;
}

export interface LuncurkanConfig {
  resources?: {
    cpu?: number;
    memory?: number;
  };
  build_command?: string;
  start_command?: string;
  environment_variables?: Record<string, string>;
  domains?: string[];
  dependencies?: Array<{
    type: string;
    [key: string]: unknown;
  }>;
}

export interface GitHubTemplate {
  slug: string;
  name: string;
  description: string;
  language: string;
  category: string;
  tags: string[];
  github_url: string;
}

export interface CreateProjectFromTemplateInput {
  name: string;
  description?: string;
  template_slug: string;
  installation_id: number;
  organization_id?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
