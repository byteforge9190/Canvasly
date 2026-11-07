import type { NormalizedPageState } from '@canvasly/dsl-schema';

export const mockPageState: NormalizedPageState = {
  page: {
    id: 'page-1',
    siteId: 'site-1',
    slug: 'home',
    title: 'Home Page',
    seo: {},
    version: 1,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  components: {
    'comp-1': {
      id: 'comp-1',
      type: 'frame',
      name: 'Hero Text',
      parentId: null,
      children: [],
      order: 0,
      frame: {
        layout: { type: 'stack', direction: 'vertical' },
        size: { widthMode: 'auto', heightMode: 'auto' },
        position: { type: 'relative' },
        spacing: {},
        style: {},
        semantic: { tag: 'h1' },
        text: {
          text: 'Welcome to our website!',
          fontSize: '4xl',
          fontWeight: '700',
          textAlign: 'center',
          textColor: '#1a1a1a',
        },
      },

      responsive: {},
      isLocked: false,
      componentContext: 'text',
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  },
  componentOrder: ['comp-1'],
};
