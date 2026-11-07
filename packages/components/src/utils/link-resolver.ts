import type { LinkValue } from '@canvasly/dsl-schema';

/**
 * Resolve a LinkValue to an href string
 */
export function resolveLinkHref(link: LinkValue | undefined): string {
  if (!link) return '#';

  switch (link.type) {
    case 'page':
      // Returns placeholder; publisher resolves to actual slug
      return link.pageId ? `/__page__/${link.pageId}` : '#';

    case 'url':
      return link.url || '#';

    case 'anchor':
      // Add # prefix (stored without #)
      return link.anchor ? `#${link.anchor}` : '#';

    case 'email': {
      if (!link.email) return '#';
      const subject = link.subject ? `?subject=${encodeURIComponent(link.subject)}` : '';
      return `mailto:${link.email}${subject}`;
    }

    case 'phone': {
      if (!link.phone) return '#';
      // Remove non-digit characters except + for tel: protocol
      const cleanPhone = link.phone.replace(/[^\d+]/g, '');
      return `tel:${cleanPhone}`;
    }

    default:
      return '#';
  }
}

/**
 * Build rel attribute for a link
 */
export function buildRelAttribute(link: LinkValue | undefined): string | undefined {
  if (!link) return undefined;

  const relParts: string[] = [];

  if (link.openInNewTab) {
    relParts.push('noopener', 'noreferrer');
  }

  if (link.rel) {
    relParts.push(link.rel);
  }

  return relParts.length > 0 ? relParts.join(' ') : undefined;
}
