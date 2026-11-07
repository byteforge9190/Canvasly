import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import type { ComponentRendererProps, RendererResult } from './base/types';

import { resolveFrameStyles } from '../utils/frame.resolver';
import { resolveFillToCSS } from '../utils/fill-resolver';
import { ComponentRenderer } from '../ComponentRenderer';
import * as LucideIcons from 'lucide-react';

import { getEffectiveFrame } from '../utils/style-generator';
import { resolveLinkHref } from '../utils/link-resolver';
import { renderInputDomain } from './domains/InputDomainRenderer';
import { renderAssistantDomain } from './domains/AssistantDomainRenderer';
import { renderOverlayDomain } from './domains/OverlayDomainRenderer';
import { renderEffectsDomain, hasAnyEffectEnabled } from './domains/EffectsDomainRenderer';
import type { EffectsRenderResult } from './domains/EffectsDomainRenderer';
import { useOverlayStore } from '../contexts/OverlayStore';
import { OVERLAYS_ENABLED } from '../config';

// Typography token mappings
const fontSizeMap: Record<string, string> = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
};

const lineHeightMap: Record<string, string> = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
};

const letterSpacingMap: Record<string, string> = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

/**
 * FrameRenderer - Universal rendering engine for frame-based components.
 * It resolves the structured 'frame' model into CSS styles and renders children.
 */
export function FrameRenderer({ component, context }: ComponentRendererProps): RendererResult {
  const {
    breakpoint,
    allComponents,
    useStaticStyles,
    componentWrapper,
    childrenWrapper: ChildrenWrapper,
    isEditorMode,
    resolveBounds,
    activeLocale,
  } = context;

  // Resolve structured frame styles (the NEW way)
  const frame = getEffectiveFrame(component, breakpoint);

  // OVERLAY RENDERING - Delegate to OverlayDomainRenderer
  if (OVERLAYS_ENABLED && frame.overlay?.enabled) {
    return renderOverlayDomain({
      component,
      frame,
      allComponents,
      breakpoint,
      useStaticStyles,
      componentWrapper,
      childrenWrapper: ChildrenWrapper,
      resolveBounds,
      isEditorMode,
      activeLocale,
    });
  }

  // NORMAL FRAME RENDERING (non-overlay)
  const frameStyles = useStaticStyles ? {} : resolveFrameStyles(frame);

  // Resolve fill styles (unified background system).
  // IMPORTANT: When any effect state has a fill override, we cannot apply fill
  // as an inline `background-color` because inline styles have the highest specificity
  // and cannot be overridden by CSS class rules (e.g., .bn-effect-state-hover:hover).
  // Instead, we surface the base fill as a CSS variable `--base-background` so
  // the effect hover/press/focus CSS rules can override it cleanly.
  const fillStyles = frame.style?.fill ? resolveFillToCSS(frame.style.fill) : {};
  const hasEffectFill = !!(
    frame.effects?.states &&
    Object.values(frame.effects.states).some(
      (s) =>
        s &&
        typeof s === 'object' &&
        'state' in s &&
        (s as { state?: { fill?: unknown } }).state?.fill,
    )
  );

  const combinedStyles: React.CSSProperties = { ...frameStyles };

  // Prevent buttons from being squished inside flex containers (Option 1)
  if (component.componentContext === 'button') {
    combinedStyles.flexShrink = 0;
  }

  if (hasEffectFill || useStaticStyles) {
    // Promote background to a CSS variable so effect rules can override it.
    // The effects.css rules read var(--base-background) as the default fallback.
    const bgValue =
      (fillStyles as Record<string, string>).background ||
      (fillStyles as Record<string, string>).backgroundColor;
    if (bgValue) {
      (combinedStyles as Record<string, string>)['--base-background'] = bgValue;
    }
  } else {
    Object.assign(combinedStyles, fillStyles);
  }

  // Resolve effects domain
  const effects = frame.effects;
  let effectsResult: EffectsRenderResult | null = null;

  if (effects && hasAnyEffectEnabled(effects)) {
    effectsResult = renderEffectsDomain({
      effects,
      componentId: component.id,
      baseStyles: combinedStyles,
      isEditorMode: !!isEditorMode,
    });

    // Apply effects to element
    if (effectsResult) {
      // Merge CSS variables into styles
      Object.entries(effectsResult.cssVariables).forEach(([key, value]) => {
        (combinedStyles as Record<string, string | number | undefined>)[key] = value;
      });

      // Merge inline styles
      Object.assign(combinedStyles, effectsResult.inlineStyles);
    }
  }

  // Extract domains
  const semantic = frame.semantic || { tag: 'div' };
  const interaction = frame.interaction;
  const textDomain = frame.text;
  const linkDomain = frame.link;
  const formDomain = frame.form;
  const inputDomain = frame.input;
  const assistantDomain = frame.assistant;

  // Determine HTML tag
  const Tag = (semantic.tag as keyof JSX.IntrinsicElements) || 'div';

  // Build semantic attributes (universal)
  const semanticProps: React.HTMLAttributes<HTMLElement> = {};
  if (semantic.role) semanticProps['role'] = semantic.role;
  if (semantic.ariaLabel) semanticProps['aria-label'] = semantic.ariaLabel;
  if (semantic.ariaDescribedBy) semanticProps['aria-describedby'] = semantic.ariaDescribedBy;
  if (semantic.ariaLabelledBy) semanticProps['aria-labelledby'] = semantic.ariaLabelledBy;
  if (semantic.ariaHidden) {
    semanticProps['aria-hidden'] = true;
  }

  // Build interaction attributes (conditional)
  const interactionProps: Record<string, unknown> = {};
  if (interaction) {
    // Overlay trigger handling
    if (interaction.triggersOverlay) {
      const overlayStore = useOverlayStore.getState();
      const triggerEvent = interaction.triggerEvent || 'click';

      if (triggerEvent === 'click') {
        interactionProps['onClick'] = (e: React.MouseEvent) => {
          e.preventDefault();
          const overlay = allComponents[interaction.triggersOverlay!];
          const closeOnTriggerClick = overlay?.frame?.overlay?.closeOnTriggerClick !== false;

          if (closeOnTriggerClick) {
            overlayStore.toggle(interaction.triggersOverlay!, component.id);
          } else {
            overlayStore.open(interaction.triggersOverlay!, component.id);
          }
        };
      } else if (triggerEvent === 'hover') {
        let closeTimeout: number | null = null;

        interactionProps['onMouseEnter'] = () => {
          if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
          }
          overlayStore.open(interaction.triggersOverlay!, component.id);
        };
        interactionProps['onMouseLeave'] = () => {
          closeTimeout = window.setTimeout(() => {
            overlayStore.close(interaction.triggersOverlay!);
          }, 300);
        };
      } else if (triggerEvent === 'focus') {
        interactionProps['onFocus'] = () => {
          overlayStore.open(interaction.triggersOverlay!, component.id);
        };
        interactionProps['onBlur'] = () => {
          overlayStore.close(interaction.triggersOverlay!);
        };
      }

      // Add data attributes for trigger identification
      interactionProps['data-triggers-overlay'] = interaction.triggersOverlay;
      interactionProps['data-trigger-event'] = triggerEvent;
    }

    // Button-specific
    if (semantic.tag === 'button') {
      interactionProps['type'] = interaction.type || 'button';
      interactionProps['disabled'] = interaction.disabled || interaction.loading;
      if (interaction.loading) {
        interactionProps['aria-busy'] = 'true';
      }
      // CRITICAL: Form integration
      if (interaction.type === 'submit') {
        interactionProps['className'] = 'bn-submit-button';
      }
    }

    // Link-specific
    if (semantic.tag === 'a') {
      interactionProps['href'] = resolveLinkHref(interaction.href);
      interactionProps['target'] = interaction.target;

      // Auto-add security for _blank
      if (interaction.target === '_blank') {
        const baseRel = interaction.rel || '';
        const hasNoopener = baseRel.includes('noopener');
        const hasNoreferrer = baseRel.includes('noreferrer');

        const relParts = [baseRel];
        if (!hasNoopener) relParts.push('noopener');
        if (!hasNoreferrer) relParts.push('noreferrer');

        interactionProps['rel'] = relParts.join(' ').trim();
      } else if (interaction.rel) {
        interactionProps['rel'] = interaction.rel;
      }

      if (interaction.download) {
        interactionProps['download'] = interaction.download;
      }
    }
  }

  // Build form attributes (conditional)
  if (semantic.tag === 'form' && formDomain) {
    if (formDomain.sendTo) {
      interactionProps['action'] = formDomain.sendTo;
      interactionProps['method'] = 'POST';
    }
    if (formDomain.redirect) {
      interactionProps['data-redirect'] = formDomain.redirect;
    }
  }

  // Handle input domain - delegate to InputDomainRenderer
  if (inputDomain) {
    return renderInputDomain({
      inputDomain,
      componentId: component.id,
      combinedStyles,
      semanticProps,
      style: frame.style,
    });
  }

  // Handle assistant domain - delegate to AssistantDomainRenderer
  if (assistantDomain) {
    return renderAssistantDomain({
      assistantDomain,
      componentId: component.id,
      combinedStyles,
      semanticProps,
      style: frame.style,
      siteId: context.siteId,
    });
  }

  // Build text content styles (if text domain exists)
  const textStyles: React.CSSProperties = {};
  if (textDomain) {
    if (textDomain.fontFamily && textDomain.fontFamily !== 'system') {
      textStyles.fontFamily = textDomain.fontFamily;
    }

    if (textDomain.fontSize) {
      textStyles.fontSize =
        textDomain.fontSize === 'custom'
          ? textDomain.customFontSize
          : fontSizeMap[textDomain.fontSize] || fontSizeMap.base;
    }

    if (textDomain.fontWeight) {
      textStyles.fontWeight = textDomain.fontWeight;
    }

    if (textDomain.lineHeight) {
      textStyles.lineHeight =
        textDomain.lineHeight === 'custom'
          ? textDomain.customLineHeight
          : lineHeightMap[textDomain.lineHeight] || lineHeightMap.normal;
    }

    if (textDomain.letterSpacing) {
      textStyles.letterSpacing =
        textDomain.letterSpacing === 'custom'
          ? textDomain.customLetterSpacing
          : letterSpacingMap[textDomain.letterSpacing] || letterSpacingMap.normal;
    }

    if (textDomain.textAlign) {
      textStyles.textAlign = textDomain.textAlign;
    }

    if (textDomain.textTransform && textDomain.textTransform !== 'none') {
      textStyles.textTransform = textDomain.textTransform;
    }

    if (textDomain.textDecoration && textDomain.textDecoration !== 'none') {
      textStyles.textDecoration = textDomain.textDecoration;
    }

    // Apply text color
    if (textDomain.textColor) {
      textStyles.color = textDomain.textColor;
    }
  }

  // Merge text styles into combined styles
  Object.assign(combinedStyles, textStyles);

  const Wrapper = ChildrenWrapper || React.Fragment;

  // Render icon content if basicons domain exists
  const basiconsDomain = frame.basicons;
  const iconContent = basiconsDomain?.icon
    ? (() => {
        try {
          // Access the icon from the imported LucideIcons namespace
          const iconMap = LucideIcons as unknown as Record<
            string,
            React.ComponentType<{
              color?: string;
              width?: string;
              height?: string;
              strokeWidth?: number;
            }>
          >;
          const IconComponent = iconMap[basiconsDomain.icon];

          // Check if icon exists (handles both functions and forward refs)
          if (!IconComponent) {
            console.warn(`Icon "${basiconsDomain.icon}" not found in lucide-react`);
            return null;
          }

          const iconProps = {
            color: basiconsDomain.color || '#000000',
            width: basiconsDomain.width || '24px',
            height: basiconsDomain.width || '24px', // Use width for both to maintain square aspect
            strokeWidth: 2,
          };

          return React.createElement(IconComponent, iconProps);
        } catch (error) {
          console.error('Error rendering icon:', error);
          return null;
        }
      })()
    : null;

  // Render text content if it exists
  const textContent = textDomain?.text ? (
    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(textDomain.text) }} />
  ) : null;

  // Wrap text in link if link domain exists
  const wrappedTextContent =
    textContent && linkDomain?.linkTo ? (
      <a
        href={resolveLinkHref(linkDomain.linkTo)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit', textDecoration: 'inherit' }}
      >
        {textContent}
      </a>
    ) : (
      textContent
    );

  const childrenContent = (
    <Wrapper items={component.children} parentId={component.id}>
      {iconContent}
      {wrappedTextContent}
      {component.children.map((childId: string) => {
        const childComponent = allComponents[childId];
        if (!childComponent) return null;

        return (
          <ComponentRenderer
            key={childId}
            component={childComponent}
            allComponents={allComponents}
            breakpoint={breakpoint}
            useStaticStyles={useStaticStyles}
            componentWrapper={componentWrapper}
            childrenWrapper={ChildrenWrapper}
            resolveBounds={resolveBounds}
            isEditorMode={isEditorMode}
            activeLocale={activeLocale}
          />
        );
      })}

      {/* Loading spinner for buttons */}
      {semantic.tag === 'button' && interaction?.loading && (
        <span className="bn-loading-indicator">
          <svg className="bn-spinner" viewBox="0 0 24 24" fill="none">
            <circle
              className="bn-opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="bn-opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </Wrapper>
  );

  const finalClassName =
    `bn-component bn-component-frame bn-semantic-${semantic.tag} ${(interactionProps.className as string) || ''}`.trim();
  const safeInteractionProps = { ...interactionProps };
  delete safeInteractionProps.className;

  // Wrap children for Ticker system if enabled
  let finalChildren = childrenContent;
  if (effects?.systems?.ticker?.enabled) {
    // Create the content wrapper
    const contentWrapper = React.createElement(
      'div',
      { className: 'bn-effect-ticker-content' },
      childrenContent,
    );

    // Wrap it in the animation wrapper that the runtime will use
    finalChildren = React.createElement(
      'div',
      {
        className: 'bn-effect-ticker-wrapper',
        'data-ticker-wrapper': 'true',
      },
      contentWrapper,
    );
  }

  const content = React.createElement(
    Tag,
    {
      id: component.id,
      className: `${finalClassName} ${effectsResult?.cssClasses.join(' ') || ''}`.trim(),
      style: combinedStyles,
      'data-component-id': component.id,
      ...semanticProps,
      ...safeInteractionProps,
      ...(effectsResult?.dataAttributes || {}),
    },
    finalChildren,
  );

  return {
    content,
    style: {}, // Styles are applied directly to the element now
  };
}

FrameRenderer.componentType = 'frame';
