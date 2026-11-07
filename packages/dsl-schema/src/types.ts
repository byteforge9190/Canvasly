import type { FrameProps } from './frame.types';

export type SpacingValue =
  | string
  | {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };

export interface BorderValue {
  width?: string;
  style?: 'none' | 'solid' | 'dashed' | 'dotted';
  color?: string;
  radius?: string;
}

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

// Component context for schema adaptation
export type ComponentContext =
  | 'text'
  | 'button'
  | 'image'
  | 'generic'
  | 'icon'
  | 'form'
  | 'input'
  | 'assistant';

// Semantic section type — used by the AEO layer to generate structured data
export type SectionType =
  | 'header'
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'team'
  | 'faq'
  | 'contact-form'
  | 'gallery'
  | 'stats'
  | 'footer'
  | 'about'
  | 'services'
  | 'blog-post';

export interface ResponsiveOverrides {
  mobile?: {
    frame?: RecursivePartial<FrameProps>;
  };
  tablet?: {
    frame?: RecursivePartial<FrameProps>;
  };
}

export interface ComponentMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  tags?: string[];
}

import type { Locale } from './locale';

export interface Component {
  id: string;
  type: string;
  name?: string;
  parentId: string | null;
  children: string[];
  order: number;
  frame?: FrameProps; // NEW: structured visual properties
  responsive: ResponsiveOverrides;
  localized?: Record<
    Locale,
    {
      frame?: RecursivePartial<FrameProps>;
    }
  >; // NEW: Localized overrides supporting both props and frames
  isLocked: boolean;
  metadata: ComponentMetadata;
  componentContext?: ComponentContext; // NEW: Context for schema adaptation
  sectionType?: SectionType; // AEO: semantic section classification for structured data generation
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface LocalizedSEOMetadata {
  locale: Locale;
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface Page {
  id: string;
  siteId: string;
  slug: string;
  title: string;
  componentOrder: string[]; // Root-level component IDs in order
  components: Record<string, Component>;
  seo: SEOMetadata;
  seoLocalized?: LocalizedSEOMetadata[];
  themeOverrides?: Record<string, unknown>;
  headScripts?: string;
  bodyScripts?: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedPageState {
  page: Omit<Page, 'componentOrder' | 'components'>;
  components: Record<string, Component>;
  componentOrder: string[]; // Root-level component IDs in order
}

export type DropIntent =
  | { type: 'inside'; targetId: string | null; index?: number }
  | { type: 'before'; targetId: string }
  | { type: 'after'; targetId: string }
  | { type: 'beside'; targetId: string; side: 'left' | 'right' };
