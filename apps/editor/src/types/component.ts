import type { Component } from '@canvasly/dsl-schema';

export interface ComponentContent {
  components: Record<string, Component>;
  rootComponentId: string;
}

export interface CreateComponentInput {
  site_id: string;
  name: string;
  description?: string;
  tags?: string[];
  content: ComponentContent;
}

export interface UpdateComponentInput {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface ComponentListItem {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  thumbnail_url?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ComponentWithContent extends ComponentListItem {
  content: ComponentContent;
}

export interface ComponentListResponse {
  components: ComponentListItem[];
  total: number;
}

export interface ComponentListParams {
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sort_by?: 'name' | 'usage' | 'created';
}
