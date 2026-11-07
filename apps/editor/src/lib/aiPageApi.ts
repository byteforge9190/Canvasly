export type GenerationEventType =
  | 'section_planned'
  | 'section_generated'
  | 'page_complete'
  | 'section_failed'
  | 'error';

export interface PageGenerationEvent {
  seq: number;
  event: GenerationEventType;
  data: unknown;
}

export interface SectionPlan {
  total_sections: number;
  plan: string[];
}

export interface GeneratedSectionData {
  index: number;
  section_type: string;
  section_name: string;
  content: {
    rootComponentId: string;
    components: Record<string, unknown>;
  };
}

export interface PageCompleteData {
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  theme?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
}

export interface SectionFailedData {
  index: number;
  type: string;
  reason: string;
}

export interface AIPageGenerationRequest {
  site_id: string;
  page_id: string;
  prompt: string;
  locale?: string;
  style_preference?: string;
}

function mockSectionContent(sectionType: string, index: number) {
  const rootId = `ai-root-${index}`;
  return {
    rootComponentId: rootId,
    components: {
      [rootId]: {
        id: rootId,
        type: 'frame',
        name: sectionType
          .split('-')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' '),
        parentId: null,
        children: [],
        order: 0,
        frame: {
          layout: { type: 'stack', direction: 'vertical' },
          size: { widthMode: 'fill', heightMode: 'auto' },
          position: { type: 'relative' },
          spacing: { padding: { top: 60, right: 24, bottom: 60, left: 24 } },
          style: {},
          semantic: { tag: 'section' },
        },
        responsive: {},
        isLocked: false,
        componentContext: 'generic',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };
}

function generatePlanSections(prompt: string): Array<{ type: string; name: string }> {
  const promptLower = prompt.toLowerCase();
  const sections: Array<{ type: string; name: string }> = [];

  if (promptLower.includes('hero') || promptLower.includes('header')) {
    sections.push({ type: 'hero', name: 'Hero Section' });
  }
  if (promptLower.includes('feature') || promptLower.includes('service')) {
    sections.push({ type: 'features', name: 'Features' });
  }
  if (promptLower.includes('about')) {
    sections.push({ type: 'about', name: 'About Us' });
  }
  if (promptLower.includes('testimonial') || promptLower.includes('review')) {
    sections.push({ type: 'testimonials', name: 'Testimonials' });
  }
  if (promptLower.includes('pricing') || promptLower.includes('price')) {
    sections.push({ type: 'pricing', name: 'Pricing' });
  }
  if (promptLower.includes('faq') || promptLower.includes('question')) {
    sections.push({ type: 'faq', name: 'FAQ' });
  }
  if (promptLower.includes('contact')) {
    sections.push({ type: 'contact', name: 'Contact' });
  }
  if (promptLower.includes('footer')) {
    sections.push({ type: 'footer', name: 'Footer' });
  }
  if (promptLower.includes('cta') || promptLower.includes('call')) {
    sections.push({ type: 'cta', name: 'Call to Action' });
  }
  if (promptLower.includes('gallery') || promptLower.includes('portfolio')) {
    sections.push({ type: 'gallery', name: 'Gallery' });
  }
  if (promptLower.includes('team')) {
    sections.push({ type: 'team', name: 'Team' });
  }
  if (promptLower.includes('stats') || promptLower.includes('metric')) {
    sections.push({ type: 'stats', name: 'Stats' });
  }
  if (promptLower.includes('blog') || promptLower.includes('post')) {
    sections.push({ type: 'blog', name: 'Blog Posts' });
  }

  if (sections.length === 0) {
    sections.push(
      { type: 'hero', name: 'Hero Section' },
      { type: 'features', name: 'Features' },
      { type: 'cta', name: 'Call to Action' },
    );
  }

  return sections;
}

export async function* generatePage(
  request: AIPageGenerationRequest,
  _idempotencyKey: string,
  signal?: AbortSignal,
): AsyncGenerator<PageGenerationEvent> {
  let seq = 1;

  const sections = generatePlanSections(request.prompt);

  yield {
    seq: seq++,
    event: 'section_planned',
    data: {
      total_sections: sections.length,
      plan: sections.map((s) => s.type),
    },
  };

  for (let i = 0; i < sections.length; i++) {
    if (signal?.aborted) throw new Error('AbortError');

    const delay = 800 + Math.random() * 1200;
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (signal?.aborted) throw new Error('AbortError');

    yield {
      seq: seq++,
      event: 'section_generated',
      data: {
        index: i,
        section_type: sections[i].type,
        section_name: sections[i].name,
        content: mockSectionContent(sections[i].type, i),
      },
    };
  }

  yield {
    seq: seq++,
    event: 'page_complete',
    data: {
      seo: {
        title: `${request.prompt} - Canvasly`,
        description: `A beautiful page created with Canvasly about ${request.prompt}`,
        keywords: request.prompt.split(' '),
      },
    },
  };
}

export function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
