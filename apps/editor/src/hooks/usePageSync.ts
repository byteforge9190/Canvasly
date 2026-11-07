import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { pageApi, siteApi, ApiError } from '../lib/api';
import type { NormalizedPageState, Locale } from '@canvasly/dsl-schema';

const AUTOSAVE_DELAY_MS = 3000;

export function usePageSync(pageId: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const pageState = useEditorStore((state) => state.pageState);
  const setPageState = useEditorStore((state) => state.setPageState);
  const pageVersion = useEditorStore((state) => state.pageVersion);
  const setConflict = useEditorStore((state) => state.setConflict);
  const markSynced = useEditorStore((state) => state.markSynced);
  const setDefaultLocale = useEditorStore((state) => state.setDefaultLocale);
  const setActiveLocale = useEditorStore((state) => state.setActiveLocale);
  const setSupportedLocales = useEditorStore((state) => state.setSupportedLocales);

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedStateRef = useRef<string | null>(null);

  // Load page on mount
  useEffect(() => {
    if (!pageId) {
      setIsLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const pageData = await pageApi.get(pageId);

        // Fetch site details to get locales
        try {
          const siteData = await siteApi.get(pageData.site_id);
          if (siteData.settings) {
            if (siteData.settings.defaultLocale) {
              setDefaultLocale(siteData.settings.defaultLocale as Locale);
              setActiveLocale(siteData.settings.defaultLocale as Locale);
            }
            if (siteData.settings.locales) {
              setSupportedLocales(siteData.settings.locales as Locale[]);
            }
          }
        } catch (siteErr) {
          console.warn('Failed to load site settings:', siteErr);
        }

        const normalizedState: NormalizedPageState = {
          page: {
            id: pageData.id,
            siteId: pageData.site_id,
            slug: pageData.slug,
            title: pageData.title,
            seo: (pageData.seo_metadata || {}) as NormalizedPageState['page']['seo'],
            version: pageData.version,
            status: 'draft',
            createdAt: pageData.created_at,
            updatedAt: pageData.updated_at,
          },
          components: (pageData.content?.components as NormalizedPageState['components']) || {},
          componentOrder: (pageData.content?.componentOrder as string[]) || [],
        };

        setPageState(normalizedState, false);
        markSynced(pageData.version);
        lastSavedStateRef.current = JSON.stringify(normalizedState);
        setLastSaved(new Date(pageData.updated_at));
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setError('Please log in to edit this page');
          } else if (err.status === 403) {
            setError("You don't have permission to edit this page");
          } else if (err.status === 404) {
            setError('Page not found');
          } else {
            setError(err.message);
          }
        } else {
          setError('Failed to load page');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageId, setPageState, markSynced, setDefaultLocale, setActiveLocale, setSupportedLocales]);

  // Autosave
  useEffect(() => {
    if (!pageId || !pageState || isLoading) return;

    const currentState = JSON.stringify(pageState);
    if (currentState === lastSavedStateRef.current) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      savePage();
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState, pageId, isLoading]);

  const savePage = useCallback(async () => {
    if (!pageId || !pageState || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      const content = {
        componentOrder: pageState.componentOrder,
        components: pageState.components,
      };

      const updatedPage = await pageApi.update(pageId, {
        title: pageState.page.title,
        content,
        seo_metadata: pageState.page.seo as Record<string, unknown>,
        expected_version: pageVersion,
      });

      markSynced(updatedPage.version);
      lastSavedStateRef.current = JSON.stringify(pageState);
      setLastSaved(new Date());
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setConflict(0);
          setError('Page was modified. Please reload.');
        } else if (err.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to save');
      }
    } finally {
      setIsSaving(false);
    }
  }, [pageId, pageState, pageVersion, isSaving, setConflict, markSynced]);

  const saveNow = useCallback(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    return savePage();
  }, [savePage]);

  return { isLoading, isSaving, error, lastSaved, saveNow };
}
