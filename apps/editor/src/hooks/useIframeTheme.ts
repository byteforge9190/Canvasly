import { useEffect, useRef } from 'react';
import type { SiteTheme } from '@canvasly/dsl-schema';
import { generateThemeCSS } from '@canvasly/dsl-schema';

/**
 * Hook for injecting theme CSS into iframe
 * Manages theme style element lifecycle in the iframe document
 */
export function useIframeTheme(iframeRef: React.RefObject<HTMLIFrameElement>, theme: SiteTheme) {
  const styleIdRef = useRef('canvasly-theme-variables');

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) {
      return;
    }

    const doc = iframe.contentDocument;
    const styleId = styleIdRef.current;

    // Remove existing theme style if present
    const existingStyle = doc.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new theme style
    const styleElement = doc.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = generateThemeCSS(theme);

    // Insert at the beginning of head so it can be overridden
    if (doc.head.firstChild) {
      doc.head.insertBefore(styleElement, doc.head.firstChild);
    } else {
      doc.head.appendChild(styleElement);
    }

    return () => {
      // Cleanup on unmount
      const style = doc.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [iframeRef, theme]);
}

/**
 * Hook for sending theme updates to iframe via postMessage
 * Alternative approach for iframe communication
 */
export function useIframeThemeMessage(theme: SiteTheme) {
  useEffect(() => {
    // Find iframe element
    const iframe = document.querySelector('iframe[data-canvasly-preview]') as HTMLIFrameElement;
    if (!iframe || !iframe.contentWindow) {
      return;
    }

    // Send theme update message
    iframe.contentWindow.postMessage(
      {
        type: 'UPDATE_THEME',
        theme,
      },
      '*',
    );
  }, [theme]);
}
