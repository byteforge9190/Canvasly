import type { Component } from '../types';
import type { FrameProps, Fill } from '../frame.types.js';
import { DEFAULT_FRAME } from '../frame.types.js';
import { generateId } from '../utils/id-generator';

const DEFAULT_BUTTON_STYLE: FrameProps['style'] = {
  visible: true,
  borderRadius: 6,
};

const DEFAULT_BUTTON_LAYOUT: FrameProps['layout'] = {
  type: 'stack',
  direction: 'horizontal',
  alignment: 'center',
  distribution: 'center',
  gap: 8,
  padding: 12,
};

const DEFAULT_BUTTON_SPACING: FrameProps['spacing'] = {};

const DEFAULT_BUTTON_SIZE: FrameProps['size'] = {
  widthMode: 'auto',
  heightMode: 'fixed',
  height: 40,
  minWidth: 100,
};

/**
 * Factory for button child components
 */
export function createButtonChildren(
  label: string,
  iconName?: string,
  textColor: string = '#ffffff',
): Component[] {
  const children: Component[] = [];

  // Icon child
  if (iconName) {
    children.push({
      id: generateId('icon'),
      type: 'icon',
      name: 'Button Icon',
      parentId: null, // Set by parent
      children: [],
      order: 0,
      frame: {
        ...DEFAULT_FRAME,
        basicons: {
          icon: iconName,
          width: '18px',
        },
      },
      responsive: {},
      isLocked: false,
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    });
  }

  // Text child with frame-based text
  children.push({
    id: generateId('text'),
    type: 'frame',
    name: 'Button Text',
    parentId: null,
    children: [],
    order: children.length,
    frame: {
      layout: { type: 'stack', direction: 'horizontal' },
      size: { widthMode: 'auto', heightMode: 'auto' },
      position: { type: 'relative' },
      spacing: {},
      style: {},
      semantic: { tag: 'span' },
      text: {
        text: label,
        fontFamily: 'system',
        fontSize: 'sm',
        fontWeight: '500',
        lineHeight: 'normal',
        textAlign: 'center',
        textColor: textColor,
        textTransform: 'none',
      },
    },

    responsive: {},
    isLocked: false,
    componentContext: 'text',
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  });

  return children;
}

/**
 * Button Frame Presets
 * These define the "initial state" when a button is dragged from the palette.
 */
export const BUTTON_FRAME_PRESETS: Record<
  string,
  { name: string; frame: FrameProps; childText: string; textColor?: string }
> = {
  PRIMARY: {
    name: 'Primary Button',
    frame: {
      ...DEFAULT_FRAME,
      layout: DEFAULT_BUTTON_LAYOUT,
      size: DEFAULT_BUTTON_SIZE,
      position: { type: 'relative' },
      spacing: DEFAULT_BUTTON_SPACING,
      style: {
        ...DEFAULT_BUTTON_STYLE,
        fill: { type: 'solid', color: '#18181b' } as Fill, // Zinc-900 - dark background
      },
      semantic: {
        tag: 'button',
        ariaLabel: 'Primary Action',
      },
      interaction: {
        type: 'button',
      },
    },
    childText: 'Click Me',
    textColor: '#ffffff', // White text on dark background
  },

  OUTLINE: {
    name: 'Outline Button',
    frame: {
      ...DEFAULT_FRAME,
      layout: DEFAULT_BUTTON_LAYOUT,
      size: DEFAULT_BUTTON_SIZE,
      position: { type: 'relative' },
      spacing: DEFAULT_BUTTON_SPACING,
      style: {
        ...DEFAULT_BUTTON_STYLE,
        border: {
          width: 2,
          style: 'solid',
          color: '#18181b', // Zinc-900 - dark border
        },
        fill: { type: 'solid', color: 'transparent' } as Fill,
      },
      semantic: {
        tag: 'button',
      },
      interaction: {
        type: 'button',
      },
    },
    childText: 'Outline',
    textColor: '#18181b', // Dark text to match border
  },

  GHOST: {
    name: 'Ghost Button',
    frame: {
      ...DEFAULT_FRAME,
      layout: DEFAULT_BUTTON_LAYOUT,
      size: DEFAULT_BUTTON_SIZE,
      position: { type: 'relative' },
      spacing: DEFAULT_BUTTON_SPACING,
      style: {
        ...DEFAULT_BUTTON_STYLE,
        fill: { type: 'solid', color: '#f4f4f5' } as Fill, // Zinc-100 - subtle background
      },
      semantic: {
        tag: 'button',
      },
      interaction: {
        type: 'button',
      },
    },
    childText: 'Ghost',
    textColor: '#18181b', // Dark text on light background
  },

  LINK: {
    name: 'Link Button',
    frame: {
      ...DEFAULT_FRAME,
      layout: { ...DEFAULT_BUTTON_LAYOUT, padding: 8 },
      size: { widthMode: 'auto', heightMode: 'auto' },
      position: { type: 'relative' },
      spacing: {},
      style: {
        borderRadius: 4,
        fill: { type: 'solid', color: 'transparent' } as Fill,
      },
      semantic: {
        tag: 'a',
      },
      interaction: {
        href: { type: 'url', url: '#' },
        target: '_self',
      },
    },
    childText: 'Read More',
    textColor: '#2563eb', // Blue text for link style
  },

  SUBMIT: {
    name: 'Submit Button',
    frame: {
      ...DEFAULT_FRAME,
      layout: DEFAULT_BUTTON_LAYOUT,
      size: { widthMode: 'auto', heightMode: 'fixed', height: 40, minWidth: 120 },
      position: { type: 'relative' },
      spacing: DEFAULT_BUTTON_SPACING,
      style: {
        ...DEFAULT_BUTTON_STYLE,
        fill: { type: 'solid', color: '#2563eb' } as Fill, // Blue-600 - primary action color
      },
      semantic: {
        tag: 'button',
      },
      interaction: {
        type: 'submit',
        loading: false,
      },
    },
    childText: 'Submit Form',
    textColor: '#ffffff', // White text on blue background
  },
};
