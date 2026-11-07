import { vi } from 'vitest';
import type { PageData } from '../../../src/lib/api';

/**
 * Mock data for testing
 */
export const mockPageData: PageData = {
  id: 'page-123',
  site_id: 'site-456',
  slug: 'home',
  title: 'Home Page',
  content: {
    zones: {
      'zone-main': {
        id: 'zone-main',
        name: 'Main',
        components: [],
      },
    },
    components: {},
  },
  seo_metadata: {
    title: 'Home Page',
    description: 'Welcome to our site',
  },
  version: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockAsset = {
  id: 'asset-123',
  site_id: 'site-456',
  filename: 'test-image.jpg',
  mime_type: 'image/jpeg',
  size: 1024000,
  url: 'https://example.com/assets/test-image.jpg',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockAssetUploadResponse = {
  asset_id: 'asset-123',
  upload_url: 'https://example.com/upload/test-image.jpg',
};

/**
 * Mock handlers for site API endpoints
 */
export const mockSiteApi = {
  getOwnerInfo: vi.fn().mockResolvedValue({ can_publish: true }),
};

/**
 * Mock handlers for page API endpoints
 */
export const mockPageApi = {
  get: vi.fn().mockResolvedValue(mockPageData),

  update: vi
    .fn()
    .mockImplementation(
      (pageId: string, data: { title?: string; content?: unknown; expected_version: number }) => {
        return Promise.resolve({
          ...mockPageData,
          id: pageId,
          title: data.title || mockPageData.title,
          content: data.content || mockPageData.content,
          version: data.expected_version + 1,
          updated_at: new Date().toISOString(),
        });
      },
    ),

  getVersion: vi.fn().mockResolvedValue({
    id: 'page-123',
    version: 1,
  }),
};

/**
 * Mock handlers for asset API endpoints
 */
export const mockAssetsApi = {
  list: vi.fn().mockResolvedValue([mockAsset]),

  delete: vi.fn().mockResolvedValue(undefined),

  requestUpload: vi.fn().mockResolvedValue(mockAssetUploadResponse),

  confirmUpload: vi.fn().mockResolvedValue(mockAsset),

  get: vi.fn().mockResolvedValue(mockAsset),

  uploadFile: vi.fn().mockResolvedValue(undefined),
};

/**
 * Reset all mock handlers to their default state
 * Call this in beforeEach or afterEach hooks
 */
export function resetApiMocks() {
  mockSiteApi.getOwnerInfo.mockClear();

  mockPageApi.get.mockClear();
  mockPageApi.update.mockClear();
  mockPageApi.getVersion.mockClear();

  mockAssetsApi.list.mockClear();
  mockAssetsApi.delete.mockClear();
  mockAssetsApi.requestUpload.mockClear();
  mockAssetsApi.confirmUpload.mockClear();
  mockAssetsApi.get.mockClear();
  mockAssetsApi.uploadFile.mockClear();
}

/**
 * Mock the entire API module
 * Use this in your test setup or individual test files
 *
 * @example
 * ```ts
 * vi.mock('../../../src/lib/api', () => ({
 *   ...mockApiModule(),
 * }));
 * ```
 */
export function mockApiModule() {
  return {
    pageApi: mockPageApi,
    siteApi: mockSiteApi,
    assetsApi: mockAssetsApi,
    ApiError: class ApiError extends Error {
      status: number;
      constructor(status: number, message: string) {
        super(message);
        this.status = status;
      }
    },
    refreshAccessToken: vi.fn().mockResolvedValue(true),
    startTokenRefreshMonitor: vi.fn().mockReturnValue(() => {}),
  };
}

/**
 * Create a mock fetch response for testing
 */
export function createMockFetchResponse<T>(data: T, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic' as ResponseType,
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
  } as Response);
}

/**
 * Mock global fetch for API testing
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   mockGlobalFetch();
 * });
 * ```
 */
export function mockGlobalFetch() {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/api/v1/editor/pages/')) {
      return createMockFetchResponse(mockPageData);
    }
    if (url.includes('/api/v1/sites/') && url.includes('/assets')) {
      return createMockFetchResponse([mockAsset]);
    }
    if (url.includes('/api/v1/sites/') && url.includes('/owner')) {
      return createMockFetchResponse({ can_publish: true });
    }
    return createMockFetchResponse({ error: 'Not found' }, 404);
  });
}
