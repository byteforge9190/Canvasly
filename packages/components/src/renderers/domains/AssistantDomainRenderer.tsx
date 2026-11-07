import React from 'react';
import type { AssistantDomain } from '@canvasly/dsl-schema';
import type { RendererResult } from '../base/types';
import { ChatWidget } from './ChatWidget';

interface AssistantDomainRendererProps {
  assistantDomain: AssistantDomain;
  componentId: string;
  combinedStyles: React.CSSProperties;
  semanticProps: React.HTMLAttributes<HTMLElement>;
  style?: import('@canvasly/dsl-schema').FrameStyle;
  siteId?: string;
  isEditorMode?: boolean;
}

/**
 * Renders the AI Chat Assistant widget
 */
export function renderAssistantDomain({
  assistantDomain,
  componentId,
  combinedStyles,
  semanticProps,
  siteId,
}: AssistantDomainRendererProps): RendererResult {
  const finalClassName = 'bn-component bn-assistant-widget'.trim();

  // Create the chat widget element
  const widgetElement = React.createElement(ChatWidget, {
    key: componentId,
    id: componentId,
    className: finalClassName,
    style: combinedStyles,
    siteId: siteId || '',
    accentColor: assistantDomain.accentColor,
    assistantBubbleColor: assistantDomain.assistantBubbleColor,
    userBubbleColor: assistantDomain.userBubbleColor,
    fontFamily: assistantDomain.fontFamily,
    inputPlaceholder: assistantDomain.inputPlaceholder,
    headerTitle: assistantDomain.headerTitle,
    toggleIcon: assistantDomain.toggleIcon,
    toggleIconSize: assistantDomain.toggleIconSize,
    toggleButtonColor: assistantDomain.toggleButtonColor,
    toggleIconColor: assistantDomain.toggleIconColor,
    'data-component-id': componentId,
    ...semanticProps,
  });

  return {
    content: widgetElement,
    style: {},
  };
}
