const EMPTY_STATE_PREFIX = 'canvasly_empty_state_dismissed_';

export const emptyStateStorage = {
  hasSeenEmptyState: (pageId: string): boolean => {
    if (!pageId) return false;
    return localStorage.getItem(`${EMPTY_STATE_PREFIX}${pageId}`) === 'true';
  },

  markEmptyStateSeen: (pageId: string): void => {
    if (!pageId) return;
    localStorage.setItem(`${EMPTY_STATE_PREFIX}${pageId}`, 'true');
  },

  clearEmptyStateSeen: (pageId: string): void => {
    if (!pageId) return;
    localStorage.removeItem(`${EMPTY_STATE_PREFIX}${pageId}`);
  },
};
