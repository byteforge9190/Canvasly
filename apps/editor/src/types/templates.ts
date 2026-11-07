import type { Component } from '@canvasly/dsl-schema';

export type TemplateType = 'site' | 'page' | 'section';

export type TemplateCategory =
  | 'business'
  | 'portfolio'
  | 'blog'
  | 'ecommerce'
  | 'landing'
  | 'personal';

export interface Template {
  id: string;
  type: TemplateType;
  category: TemplateCategory;
  name: string;
  description?: string;
  slug: string;
  thumbnail_url?: string;
  tags: string[];
  is_system: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface SectionContent {
  components: Record<string, Component>;
  rootComponentId: string;
}

export interface TemplateWithContent extends Template {
  content: SectionContent;
  page_type?: string;
  section_type?: string;
}

export interface TemplateListResponse {
  templates: Template[];
  total: number;
  limit: number;
  offset: number;
}
