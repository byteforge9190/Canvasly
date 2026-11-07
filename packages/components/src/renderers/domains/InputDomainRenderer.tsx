import React from 'react';
import type { InputDomain, FrameStyle } from '@canvasly/dsl-schema';
import type { RendererResult } from '../base/types';

interface InputDomainRendererProps {
  inputDomain: InputDomain;
  componentId: string;
  combinedStyles: React.CSSProperties;
  semanticProps: React.HTMLAttributes<HTMLElement>;
  style?: FrameStyle;
}

/**
 * Renders input domain as the actual input/textarea element
 * The input element IS the component, not a child
 */
export function renderInputDomain({
  inputDomain,
  componentId,
  combinedStyles,
  semanticProps,
  style,
}: InputDomainRendererProps): RendererResult {
  const inputProps: React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> = {
    name: inputDomain.name,
    placeholder: inputDomain.placeholder,
    required: inputDomain.required,
  };

  const InputTag = inputDomain.type === 'textarea' ? 'textarea' : 'input';
  const htmlInputType = inputDomain.type === 'phone' ? 'tel' : inputDomain.type;

  const inputSpecificStyles: React.CSSProperties = {};
  if (inputDomain.type === 'textarea' && inputDomain.resizable === false) {
    inputSpecificStyles.resize = 'none';
  }

  const finalClassName =
    `bn-component bn-component-frame bn-input bn-input-${inputDomain.type}`.trim();

  // Create a unique ID for the placeholder style
  const placeholderStyleId = `placeholder-${componentId}`;

  // Generate placeholder color style if specified
  const placeholderColor = style?.placeholderColor;
  const placeholderStyleElement = placeholderColor
    ? React.createElement('style', {
        key: `${placeholderStyleId}-style`,
        dangerouslySetInnerHTML: {
          __html: `
          #${componentId}::placeholder {
            color: ${placeholderColor};
            opacity: 1;
          }
          #${componentId}::-webkit-input-placeholder {
            color: ${placeholderColor};
            opacity: 1;
          }
          #${componentId}::-moz-placeholder {
            color: ${placeholderColor};
            opacity: 1;
          }
          #${componentId}:-ms-input-placeholder {
            color: ${placeholderColor};
            opacity: 1;
          }
        `,
        },
      })
    : null;

  const inputElement = React.createElement(InputTag, {
    id: componentId,
    className: finalClassName,
    style: { ...combinedStyles, ...inputSpecificStyles },
    'data-component-id': componentId,
    type: InputTag === 'input' ? htmlInputType : undefined,
    ...inputProps,
    ...semanticProps,
  });

  // Wrap with fragment to include both style and input
  const content = placeholderStyleElement
    ? React.createElement(React.Fragment, {}, placeholderStyleElement, inputElement)
    : inputElement;

  return {
    content,
    style: {},
  };
}
