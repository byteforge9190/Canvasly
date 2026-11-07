export interface PageData {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  content: Record<string, unknown>;
  seo_metadata?: Record<string, unknown>;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface PageListItem {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  name: string;
  subdomain: string;
  status: 'draft' | 'published';
  settings?: {
    defaultLocale: import('@canvasly/dsl-schema').Locale;
    locales: import('@canvasly/dsl-schema').Locale[];
  };
}

export interface Asset {
  id: string;
  site_id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  reference_count: number;
  created_at: string;
}

const storedState = {
  current: null as PageData | null,
};

function generateId(): string {
  return `id-${Math.random().toString(36).slice(2, 11)}`;
}

export const pageApi = {
  get: async (pageId: string): Promise<PageData> => {
    if (storedState.current && storedState.current.id === pageId) {
      return storedState.current;
    }
    return {
      id: pageId,
      site_id: 'site-1',
      slug: 'home',
      title: 'Home Page',
      content: {},
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  list: async (siteId: string): Promise<PageListItem[]> => {
    return [
      {
        id: 'page-1',
        site_id: siteId,
        slug: 'home',
        title: 'Home',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  update: async (
    pageId: string,
    data: {
      title?: string;
      content?: Record<string, unknown>;
      seo_metadata?: Record<string, unknown>;
      expected_version: number;
    },
  ): Promise<PageData> => {
    const pageData: PageData = {
      id: pageId,
      site_id: 'site-1',
      slug: 'home',
      title: data.title || 'Home Page',
      content: data.content || {},
      seo_metadata: data.seo_metadata,
      version: data.expected_version + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    storedState.current = pageData;
    return pageData;
  },

  getVersion: async (pageId: string): Promise<{ id: string; version: number }> => {
    return { id: pageId, version: storedState.current?.version || 1 };
  },
};

export const siteApi = {
  get: async (siteId: string): Promise<Site> => ({
    id: siteId,
    name: 'My Site',
    subdomain: 'mysite',
    status: 'draft',
    settings: {
      defaultLocale: 'en' as import('@canvasly/dsl-schema').Locale,
      locales: ['en' as import('@canvasly/dsl-schema').Locale],
    },
  }),

  getOwnerInfo: async () => ({
    can_publish: true,
    email_verified: true,
    subscription_active: true,
    status: 'active',
  }),

  update: async (siteId: string, data: Partial<Site>): Promise<Site> => ({
    id: siteId,
    name: data.name || 'My Site',
    subdomain: data.subdomain || 'mysite',
    status: data.status || 'draft',
  }),

  publish: async (): Promise<{ siteUrl: string }> => ({
    siteUrl: 'https://mysite.canvasly.dev',
  }),

  getTheme: async () => ({
    theme: {} as import('@canvasly/dsl-schema').SiteTheme,
  }),
};

export const assetsApi = {
  list: async (_siteId: string, _page = 1, _limit = 20): Promise<Asset[]> => [],

  delete: async (_siteId: string, _assetId: string): Promise<void> => {},

  get: async (_siteId: string, _assetId: string): Promise<Asset> => {
    throw new Error('Asset not found');
  },

  upload: async (siteId: string, file: File): Promise<Asset> => ({
    id: generateId(),
    site_id: siteId,
    url: URL.createObjectURL(file),
    filename: file.name,
    size: file.size,
    mime_type: file.type,
    reference_count: 0,
    created_at: new Date().toISOString(),
  }),
};

export const formsApi = {
  list: async (_siteId: string): Promise<Array<{ id: string; name: string }>> => [],
};

export const templateApi = {
  list: async (_params?: { type?: string; limit?: number }) => ({
    templates: [] as import('../types/templates').Template[],
    total: 0,
  }),

  get: async (_id: string): Promise<import('../types/templates').TemplateWithContent> => {
    throw new Error('Template not found');
  },
};

export const componentApi = {
  list: async () => ({ components: [], total: 0 }),

  get: async () => {
    throw new Error('Component not found');
  },

  create: async () => {
    throw new Error('Not available in local mode');
  },

  update: async () => {
    throw new Error('Not available in local mode');
  },

  delete: async () => {},

  duplicate: async () => {
    throw new Error('Not available in local mode');
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
