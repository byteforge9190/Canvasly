import type { PropertySchema } from './schema';

export type FrameDomain =
  | 'layout'
  | 'size'
  | 'position'
  | 'style'
  | 'semantic'
  | 'interaction'
  | 'overlay'
  | 'text'
  | 'basicons'
  | 'link'
  | 'form'
  | 'input'
  | 'assistant'
  | 'effects';

export interface FrameSchemaSection {
  domain: FrameDomain;
  label: string;
  icon?: string;
  schemas: PropertySchema[];
  collapsed?: boolean;
}

export interface FrameSchema {
  sections: FrameSchemaSection[];
}

// --- Basicons Section ---
export const basiconsSection: FrameSchemaSection = {
  domain: 'basicons',
  label: 'Basicons',
  icon: 'Star',
  collapsed: false,
  schemas: [
    {
      key: 'basicons.icon',
      path: 'basicons.icon',
      domain: 'basicons',
      label: 'Icon',
      type: 'icon',
      defaultValue: 'Star',
      ui: {
        helpText: 'Select an icon from the library',
      },
    },
    {
      key: 'basicons.color',
      path: 'basicons.color',
      domain: 'basicons',
      label: 'Color',
      type: 'color',
      defaultValue: '#000000',
    },
    {
      key: 'basicons.width',
      path: 'basicons.width',
      domain: 'basicons',
      label: 'Width',
      type: 'string', // Use string for width to allow px, rem, etc.
      defaultValue: '24px',
      ui: {
        placeholder: '24px, 1.5rem',
      },
    },
  ],
};

// --- Link Section (Text-specific) ---
export const linkSection: FrameSchemaSection = {
  domain: 'link',
  label: 'Link',
  icon: 'Link',
  collapsed: false,
  schemas: [
    {
      key: 'link.linkTo',
      path: 'link.linkTo',
      domain: 'link',
      label: 'Link To',
      type: 'link',
      defaultValue: undefined,
      ui: {
        placeholder: 'https://example.com or /page',
        helpText: 'Link destination for this text',
      },
    },
  ],
};

// --- Form Section (Form-specific) ---
export const formSection: FrameSchemaSection = {
  domain: 'form',
  label: 'Form',
  icon: 'FileText',
  collapsed: false,
  schemas: [
    {
      key: 'form.sendTo',
      path: 'form.sendTo',
      domain: 'form',
      label: 'Send To',
      type: 'form-picker',
      defaultValue: '',
      ui: {
        helpText: 'Select a form or enter an external URL',
      },
    },
    {
      key: 'form.redirect',
      path: 'form.redirect',
      domain: 'form',
      label: 'Redirect After Submit',
      type: 'string',
      defaultValue: '',
      ui: {
        placeholder: '/thank-you or https://example.com/success',
        helpText: 'Optional URL to redirect to after successful submission',
      },
    },
  ],
};

// --- Input Section (Input-specific) ---
export const inputSection: FrameSchemaSection = {
  domain: 'input',
  label: 'Input',
  icon: 'Type',
  collapsed: false,
  schemas: [
    {
      key: 'input.type',
      path: 'input.type',
      domain: 'input',
      label: 'Input Type',
      type: 'select',
      defaultValue: 'text',
      ui: {
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Textarea', value: 'textarea' },
          { label: 'Email', value: 'email' },
          { label: 'Number', value: 'number' },
          { label: 'Phone Number', value: 'phone' },
          { label: 'URL', value: 'url' },
        ],
        helpText: 'Type of input field',
      },
    },
    {
      key: 'input.name',
      path: 'input.name',
      domain: 'input',
      label: 'Name',
      type: 'string',
      defaultValue: '',
      ui: {
        placeholder: 'field-name',
        helpText: 'Name attribute for form submission',
      },
    },
    {
      key: 'input.placeholder',
      path: 'input.placeholder',
      domain: 'input',
      label: 'Placeholder',
      type: 'string',
      defaultValue: '',
      ui: {
        placeholder: 'Enter placeholder text...',
        helpText: 'Placeholder text shown when field is empty',
      },
    },
    {
      key: 'input.required',
      path: 'input.required',
      domain: 'input',
      label: 'Required',
      type: 'boolean',
      defaultValue: false,
      ui: {
        helpText: 'Whether this field is required',
      },
    },
    {
      key: 'input.resizable',
      path: 'input.resizable',
      domain: 'input',
      label: 'Resizable',
      type: 'boolean',
      defaultValue: true,
      showWhen: { key: 'input.type', operator: 'eq', value: 'textarea' },
      ui: {
        helpText: 'Allow user to resize the textarea',
      },
    },
  ],
};

// --- Assistant Section (Assistant-specific) ---
export const assistantSection: FrameSchemaSection = {
  domain: 'assistant',
  label: 'Assistant',
  icon: 'MessageCircle',
  collapsed: false,
  schemas: [
    {
      key: 'assistant.headerTitle',
      path: 'assistant.headerTitle',
      domain: 'assistant',
      label: 'Header Title',
      type: 'string',
      defaultValue: 'Ask us anything',
      ui: {
        placeholder: 'Ask us anything',
        helpText: 'Title shown in chat header',
      },
    },
    {
      key: 'assistant.inputPlaceholder',
      path: 'assistant.inputPlaceholder',
      domain: 'assistant',
      label: 'Input Placeholder',
      type: 'string',
      defaultValue: 'Type a message...',
      ui: {
        placeholder: 'Type a message...',
        helpText: 'Placeholder text for message input',
      },
    },
    {
      key: 'assistant.accentColor',
      path: 'assistant.accentColor',
      domain: 'assistant',
      label: 'Accent Color',
      type: 'color',
      defaultValue: '#3b82f6',
      ui: {
        helpText: 'Primary color for buttons and user messages',
      },
    },
    {
      key: 'assistant.assistantBubbleColor',
      path: 'assistant.assistantBubbleColor',
      domain: 'assistant',
      label: 'Assistant Bubble Color',
      type: 'color',
      defaultValue: '#f3f4f6',
      ui: {
        helpText: 'Background color for assistant messages',
      },
    },
    {
      key: 'assistant.userBubbleColor',
      path: 'assistant.userBubbleColor',
      domain: 'assistant',
      label: 'User Bubble Color',
      type: 'color',
      defaultValue: '#3b82f6',
      ui: {
        helpText: 'Background color for user messages',
      },
    },
    {
      key: 'assistant.fontFamily',
      path: 'assistant.fontFamily',
      domain: 'assistant',
      label: 'Font Family',
      type: 'string',
      defaultValue: '',
      ui: {
        placeholder: 'inherit',
        helpText: 'Font family for chat text (leave empty to inherit)',
      },
    },
    {
      key: 'assistant.toggleIcon',
      path: 'assistant.toggleIcon',
      domain: 'assistant',
      label: 'Toggle Icon',
      type: 'icon',
      defaultValue: 'MessageCircle',
      ui: { helpText: 'Icon for the chat toggle button' },
    },
    {
      key: 'assistant.toggleIconSize',
      path: 'assistant.toggleIconSize',
      domain: 'assistant',
      label: 'Toggle Icon Size',
      type: 'number',
      defaultValue: 28,
      ui: { min: 16, max: 64, step: 1 },
    },
    {
      key: 'assistant.toggleButtonColor',
      path: 'assistant.toggleButtonColor',
      domain: 'assistant',
      label: 'Toggle Button Color',
      type: 'color',
      defaultValue: '#3b82f6',
      ui: { helpText: 'Background color of the toggle button' },
    },
    {
      key: 'assistant.toggleIconColor',
      path: 'assistant.toggleIconColor',
      domain: 'assistant',
      label: 'Toggle Icon Color',
      type: 'color',
      defaultValue: '#ffffff',
      ui: { helpText: 'Color of the toggle button icon' },
    },
  ],
};

// --- Pre-built sections ---

export const layoutSection: FrameSchemaSection = {
  domain: 'layout',
  label: 'Layout',
  schemas: [
    {
      key: 'layout.type',
      path: 'layout.type',
      domain: 'layout',
      label: 'Type',
      type: 'select',
      defaultValue: 'stack',
      ui: {
        options: [
          { label: 'Stack', value: 'stack' },
          { label: 'Grid', value: 'grid' },
        ],
      },
    },
    {
      key: 'layout.direction',
      path: 'layout.direction',
      domain: 'layout',
      label: 'Direction',
      type: 'select',
      defaultValue: 'vertical',
      ui: {
        options: [
          { label: 'Vertical', value: 'vertical' },
          { label: 'Horizontal', value: 'horizontal' },
        ],
      },
      showWhen: { key: 'layout.type', operator: 'eq', value: 'stack' },
    },
    {
      key: 'layout.distribution',
      path: 'layout.distribution',
      domain: 'layout',
      label: 'Distribution',
      type: 'select',
      defaultValue: 'start',
      ui: {
        options: [
          { label: 'Start', value: 'start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'end' },
          { label: 'Space Between', value: 'space-between' },
          { label: 'Space Around', value: 'space-around' },
          { label: 'Space Evenly', value: 'space-evenly' },
        ],
      },
      showWhen: { key: 'layout.type', operator: 'eq', value: 'stack' },
    },
    {
      key: 'layout.alignment',
      path: 'layout.alignment',
      domain: 'layout',
      label: 'Alignment',
      type: 'select',
      defaultValue: 'start',
      ui: {
        options: [
          { label: 'Start', value: 'start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'end' },
          { label: 'Stretch', value: 'stretch' },
        ],
      },
      showWhen: { key: 'layout.type', operator: 'eq', value: 'stack' },
    },
    {
      key: 'layout.wrap',
      path: 'layout.wrap',
      domain: 'layout',
      label: 'Wrap',
      type: 'boolean',
      defaultValue: false,
      showWhen: { key: 'layout.type', operator: 'eq', value: 'stack' },
    },
    {
      key: 'layout.gap',
      path: 'layout.gap',
      domain: 'layout',
      label: 'Gap',
      type: 'number',
      defaultValue: 0,
      ui: {
        min: 0,
        max: 200,
        step: 4,
      },
    },
    {
      key: 'layout.padding',
      path: 'layout.padding',
      domain: 'layout',
      label: 'Padding',
      type: 'padding',
      defaultValue: 0,
      ui: {
        min: 0,
        max: 200,
        step: 4,
        helpText: 'Padding around the container',
      },
    },
    {
      key: 'layout.columns',
      path: 'layout.columns',
      domain: 'layout',
      label: 'Columns',
      type: 'number',
      defaultValue: 3,
      ui: {
        min: 1,
        max: 12,
        step: 1,
      },
      showWhen: { key: 'layout.type', operator: 'eq', value: 'grid' },
    },
    {
      key: 'layout.masonry',
      path: 'layout.masonry',
      domain: 'layout',
      label: 'Masonry',
      type: 'boolean',
      defaultValue: false,
      ui: {
        helpText: 'Auto-flow rows for dynamic height items',
      },
      showWhen: { key: 'layout.type', operator: 'eq', value: 'grid' },
    },
    {
      key: 'layout.rows',
      path: 'layout.rows',
      domain: 'layout',
      label: 'Rows',
      type: 'number',
      defaultValue: 1,
      ui: {
        min: 1,
        max: 12,
        step: 1,
      },
      showWhen: { key: 'layout.type', operator: 'eq', value: 'grid' },
    },
  ],
};

export const sizeSection: FrameSchemaSection = {
  domain: 'size',
  label: 'Size',
  schemas: [
    {
      key: 'size.widthMode',
      path: 'size.widthMode',
      domain: 'size',
      label: 'Width Mode',
      type: 'select',
      defaultValue: 'auto',
      ui: {
        options: [
          { label: 'Auto', value: 'auto' },
          { label: 'Fixed', value: 'fixed' },
          { label: 'Fill', value: 'fill' },
          { label: 'Fit Content', value: 'fit-content' },
        ],
        helpText: 'How width is determined',
      },
    },
    {
      key: 'size.width',
      path: 'size.width',
      domain: 'size',
      label: 'Width',
      type: 'number',
      defaultValue: 200,
      ui: { min: 0, max: 5000, step: 1 },
      showWhen: { key: 'size.widthMode', operator: 'eq', value: 'fixed' },
    },
    {
      key: 'size.heightMode',
      path: 'size.heightMode',
      domain: 'size',
      label: 'Height Mode',
      type: 'select',
      defaultValue: 'auto',
      ui: {
        options: [
          { label: 'Auto', value: 'auto' },
          { label: 'Fixed', value: 'fixed' },
          { label: 'Fill', value: 'fill' },
          { label: 'Fit Content', value: 'fit-content' },
        ],
        helpText: 'How height is determined',
      },
    },
    {
      key: 'size.height',
      path: 'size.height',
      domain: 'size',
      label: 'Height',
      type: 'number',
      defaultValue: 200,
      ui: { min: 0, max: 5000, step: 1 },
      showWhen: { key: 'size.heightMode', operator: 'eq', value: 'fixed' },
    },
    {
      key: 'size.minWidth',
      path: 'size.minWidth',
      domain: 'size',
      label: 'Min Width',
      type: 'number',
      defaultValue: undefined,
      ui: { min: 0, max: 5000, step: 1 },
    },
    {
      key: 'size.maxWidth',
      path: 'size.maxWidth',
      domain: 'size',
      label: 'Max Width',
      type: 'number',
      defaultValue: undefined,
      ui: { min: 0, max: 5000, step: 1 },
    },
    {
      key: 'size.minHeight',
      path: 'size.minHeight',
      domain: 'size',
      label: 'Min Height',
      type: 'number',
      defaultValue: undefined,
      ui: { min: 0, max: 5000, step: 1 },
    },
    {
      key: 'size.maxHeight',
      path: 'size.maxHeight',
      domain: 'size',
      label: 'Max Height',
      type: 'number',
      defaultValue: undefined,
      ui: { min: 0, max: 5000, step: 1 },
    },
  ],
};

export const positionSection: FrameSchemaSection = {
  domain: 'position',
  label: 'Position',
  collapsed: true,
  schemas: [
    {
      key: 'position.type',
      path: 'position.type',
      domain: 'position',
      label: 'Type',
      type: 'select',
      defaultValue: 'relative',
      ui: {
        options: [
          { label: 'Relative', value: 'relative' },
          { label: 'Absolute', value: 'absolute' },
          { label: 'Fixed', value: 'fixed' },
          { label: 'Sticky', value: 'sticky' },
        ],
      },
    },
    {
      key: 'position.top',
      path: 'position.top',
      domain: 'position',
      label: 'Top',
      type: 'number',
      defaultValue: 0,
      ui: {
        min: -1000,
        max: 1000,
        step: 1,
      },
      showWhen: { key: 'position.type', operator: 'neq', value: 'relative' },
    },
    {
      key: 'position.right',
      path: 'position.right',
      domain: 'position',
      label: 'Right',
      type: 'number',
      defaultValue: 0,
      ui: {
        min: -1000,
        max: 1000,
        step: 1,
      },
      showWhen: { key: 'position.type', operator: 'neq', value: 'relative' },
    },
    {
      key: 'position.bottom',
      path: 'position.bottom',
      domain: 'position',
      label: 'Bottom',
      type: 'number',
      defaultValue: 0,
      ui: {
        min: -1000,
        max: 1000,
        step: 1,
      },
      showWhen: { key: 'position.type', operator: 'neq', value: 'relative' },
    },
    {
      key: 'position.left',
      path: 'position.left',
      domain: 'position',
      label: 'Left',
      type: 'number',
      defaultValue: 0,
      ui: {
        min: -1000,
        max: 1000,
        step: 1,
      },
      showWhen: { key: 'position.type', operator: 'neq', value: 'relative' },
    },
  ],
};

export const styleSection: FrameSchemaSection = {
  domain: 'style',
  label: 'Style',
  schemas: [
    {
      key: 'style.visible',
      path: 'style.visible',
      domain: 'style',
      label: 'Visible',
      type: 'boolean',
      defaultValue: true,
      ui: {
        helpText: 'Toggle component visibility',
      },
    },
    {
      key: 'style.fill',
      path: 'style.fill',
      domain: 'style',
      label: 'Fill',
      type: 'fill',
      defaultValue: { type: 'none' },
      ui: {
        helpText: 'Background color, gradient, or image',
      },
    },
    {
      key: 'style.border',
      path: 'style.border',
      domain: 'style',
      label: 'Border',
      type: 'border',
      defaultValue: undefined,
      ui: {
        helpText: 'Border style, width, and color',
      },
    },
    {
      key: 'style.borderRadius',
      path: 'style.borderRadius',
      domain: 'style',
      label: 'Corner Radius',
      type: 'number',
      defaultValue: 0,
      ui: {
        min: 0,
        max: 100,
        step: 1,
        helpText: 'Border radius in pixels',
      },
    },
    {
      key: 'style.shadow',
      path: 'style.shadow',
      domain: 'style',
      label: 'Shadow',
      type: 'shadow',
      defaultValue: undefined,
      ui: {
        helpText: 'Box shadow configuration',
      },
    },
    {
      key: 'style.opacity',
      path: 'style.opacity',
      domain: 'style',
      label: 'Opacity',
      type: 'number',
      defaultValue: 1,
      ui: {
        min: 0,
        max: 1,
        step: 0.01,
        helpText: 'Element transparency (0 = invisible, 1 = opaque)',
      },
    },
    {
      key: 'style.overflow',
      path: 'style.overflow',
      domain: 'style',
      label: 'Overflow',
      type: 'select',
      defaultValue: 'visible',
      ui: {
        options: [
          { label: 'Visible', value: 'visible' },
          { label: 'Hidden', value: 'hidden' },
          { label: 'Scroll', value: 'scroll' },
          { label: 'Auto', value: 'auto' },
          { label: 'Clip', value: 'clip' },
        ],
        helpText: 'How content that overflows the element is handled',
      },
    },
    {
      key: 'style.zIndex',
      path: 'style.zIndex',
      domain: 'style',
      label: 'Z-Index',
      type: 'number',
      defaultValue: 0,
      ui: {
        min: -100,
        max: 100,
        step: 1,
        helpText: 'Stacking order (higher values appear on top)',
      },
    },
    {
      key: 'style.placeholderColor',
      path: 'style.placeholderColor',
      domain: 'style',
      label: 'Placeholder Color',
      type: 'color',
      defaultValue: '#9ca3af',
      ui: {
        helpText: 'Color of placeholder text in input fields',
      },
    },
  ],
};

// --- Semantic Section (Universal) ---
export const semanticSection: FrameSchemaSection = {
  domain: 'semantic',
  label: 'Semantic HTML',
  icon: 'Code',
  collapsed: false,
  schemas: [
    {
      key: 'semantic.tag',
      path: 'semantic.tag',
      domain: 'semantic',
      label: 'HTML Tag',
      type: 'select',
      defaultValue: 'div',
      ui: {
        options: [
          // Layout/Structure
          { label: '📦 Div (Generic)', value: 'div' },
          { label: '📄 Main', value: 'main' },
          { label: '🎯 Header', value: 'header' },
          { label: '🦶 Footer', value: 'footer' },
          { label: '📌 Aside', value: 'aside' },
          { label: '🧭 Nav', value: 'nav' },
          { label: '📑 Section', value: 'section' },
          { label: '📰 Article', value: 'article' },

          // Content
          { label: '🖼️ Figure', value: 'figure' },
          { label: '💬 Blockquote', value: 'blockquote' },

          // Interactive
          { label: '🔘 Button', value: 'button' },
          { label: '🔗 Link (a)', value: 'a' },
          { label: '📋 Form', value: 'form' },

          // Inline
          { label: '✨ Span', value: 'span' },
        ],
        helpText: 'Choose semantic HTML element for better accessibility and SEO',
      },
    },
    {
      key: 'semantic.role',
      path: 'semantic.role',
      domain: 'semantic',
      label: 'ARIA Role',
      type: 'select',
      defaultValue: '',
      ui: {
        options: [
          { label: 'None (Use Default)', value: '' },
          { label: 'Banner', value: 'banner' },
          { label: 'Navigation', value: 'navigation' },
          { label: 'Main', value: 'main' },
          { label: 'Complementary', value: 'complementary' },
          { label: 'Contentinfo', value: 'contentinfo' },
          { label: 'Region', value: 'region' },
          { label: 'Search', value: 'search' },
          { label: 'Form', value: 'form' },
          { label: 'Button', value: 'button' },
          { label: 'Link', value: 'link' },
        ],
        helpText: 'Override default ARIA role (advanced)',
      },
    },
    {
      key: 'semantic.ariaLabel',
      path: 'semantic.ariaLabel',
      domain: 'semantic',
      label: 'ARIA Label',
      type: 'string',
      defaultValue: '',
      ui: {
        placeholder: 'Descriptive label for screen readers',
        helpText: 'Accessible name for this element',
      },
    },
    {
      key: 'semantic.ariaDescribedBy',
      path: 'semantic.ariaDescribedBy',
      domain: 'semantic',
      label: 'ARIA Described By',
      type: 'string',
      defaultValue: '',
      ui: {
        placeholder: 'Space-separated element IDs',
        helpText: 'References elements that describe this one',
      },
    },
  ],
};

// --- Interaction Section (Conditional) ---
export const interactionSection: FrameSchemaSection = {
  domain: 'interaction',
  label: 'Interaction',
  icon: 'MousePointer2',
  collapsed: false,
  schemas: [
    {
      key: 'interaction.type',
      path: 'interaction.type',
      domain: 'interaction',
      label: 'Button Type',
      type: 'select',
      defaultValue: 'button',
      showWhen: { key: 'semantic.tag', operator: 'eq', value: 'button' },
      ui: {
        options: [
          { label: 'Generic Button', value: 'button' },
          { label: 'Submit Form', value: 'submit' },
          { label: 'Reset Form', value: 'reset' },
        ],
        helpText: 'Type of button behavior',
      },
    },
    {
      key: 'interaction.disabled',
      path: 'interaction.disabled',
      domain: 'interaction',
      label: 'Disabled',
      type: 'boolean',
      defaultValue: false,
      showWhen: { key: 'semantic.tag', operator: 'eq', value: 'button' },
      ui: {
        helpText: 'Disable user interaction',
      },
    },
    {
      key: 'interaction.loading',
      path: 'interaction.loading',
      domain: 'interaction',
      label: 'Loading State',
      type: 'boolean',
      defaultValue: false,
      showWhen: { key: 'semantic.tag', operator: 'eq', value: 'button' },
      ui: {
        helpText: 'Show loading indicator (preview only)',
      },
    },
    {
      key: 'interaction.href',
      path: 'interaction.href',
      domain: 'interaction',
      label: 'URL',
      type: 'link',
      defaultValue: '',
      showWhen: { key: 'semantic.tag', operator: 'eq', value: 'a' },
      ui: {
        placeholder: 'https://example.com or /page',
        helpText: 'Link destination',
      },
    },
    {
      key: 'interaction.target',
      path: 'interaction.target',
      domain: 'interaction',
      label: 'Open In',
      type: 'select',
      defaultValue: '_self',
      showWhen: { key: 'semantic.tag', operator: 'eq', value: 'a' },
      ui: {
        options: [
          { label: 'Same Window', value: '_self' },
          { label: 'New Tab', value: '_blank' },
          { label: 'Parent Frame', value: '_parent' },
          { label: 'Top Frame', value: '_top' },
        ],
      },
    },
    {
      key: 'interaction.rel',
      path: 'interaction.rel',
      domain: 'interaction',
      label: 'Relationship',
      type: 'string',
      defaultValue: '',
      showWhen: { key: 'semantic.tag', operator: 'eq', value: 'a' },
      ui: {
        placeholder: 'noopener noreferrer, sponsored, nofollow',
        helpText: 'Link relationship attributes',
      },
    },
    {
      key: 'interaction.download',
      path: 'interaction.download',
      domain: 'interaction',
      label: 'Download Filename',
      type: 'string',
      defaultValue: '',
      showWhen: { key: 'semantic.tag', operator: 'eq', value: 'a' },
      ui: {
        placeholder: 'Optional filename for downloads',
        helpText: 'Force download with this filename',
      },
    },
    {
      key: 'interaction.triggersOverlay',
      path: 'interaction.triggersOverlay',
      domain: 'interaction',
      label: 'Triggers Overlay',
      type: 'string',
      defaultValue: '',
      ui: {
        placeholder: 'Overlay Component ID',
        helpText: 'ID of overlay to trigger',
      },
    },
    {
      key: 'interaction.triggerEvent',
      path: 'interaction.triggerEvent',
      domain: 'interaction',
      label: 'Trigger Event',
      type: 'select',
      defaultValue: 'click',
      showWhen: { key: 'interaction.triggersOverlay', operator: 'neq', value: '' },
      ui: {
        options: [
          { label: 'Click', value: 'click' },
          { label: 'Hover', value: 'hover' },
          { label: 'Focus', value: 'focus' },
        ],
        helpText: 'Event that triggers overlay',
      },
    },
  ],
};

/**
 * Composable helper: pick sections relevant to a component type
 */
export function createFrameSchema(...sections: FrameSchemaSection[]): FrameSchema {
  return { sections };
}

// --- Text Section (Text-specific) ---
export const textSection: FrameSchemaSection = {
  domain: 'text',
  label: 'Text',
  icon: 'Type',
  collapsed: false,
  schemas: [
    {
      key: 'text.text',
      path: 'text.text',
      domain: 'text',
      label: 'Text',
      type: 'richtext',
      defaultValue: 'Edit text...',
      ui: {
        rows: 3,
        helpText: 'Text content (supports basic HTML)',
      },
    },
    {
      key: 'text.fontFamily',
      path: 'text.fontFamily',
      domain: 'text',
      label: 'Font Family',
      type: 'select',
      defaultValue: 'system',
      ui: {
        options: [
          { label: 'System', value: 'system' },
          { label: 'Inter', value: 'Inter' },
          { label: 'Roboto', value: 'Roboto' },
          { label: 'Open Sans', value: 'Open Sans' },
          { label: 'Lato', value: 'Lato' },
          { label: 'Montserrat', value: 'Montserrat' },
          { label: 'Poppins', value: 'Poppins' },
        ],
      },
    },
    {
      key: 'text.fontSize',
      path: 'text.fontSize',
      domain: 'text',
      label: 'Font Size',
      type: 'select',
      defaultValue: 'base',
      ui: {
        options: [
          { label: 'XS (12px)', value: 'xs' },
          { label: 'SM (14px)', value: 'sm' },
          { label: 'Base (16px)', value: 'base' },
          { label: 'LG (18px)', value: 'lg' },
          { label: 'XL (20px)', value: 'xl' },
          { label: '2XL (24px)', value: '2xl' },
          { label: '3XL (30px)', value: '3xl' },
          { label: '4XL (36px)', value: '4xl' },
          { label: '5XL (48px)', value: '5xl' },
          { label: '6XL (60px)', value: '6xl' },
          { label: 'Custom', value: 'custom' },
        ],
      },
    },
    {
      key: 'text.customFontSize',
      path: 'text.customFontSize',
      domain: 'text',
      label: 'Custom Size',
      type: 'string',
      defaultValue: '16px',
      showWhen: { key: 'text.fontSize', operator: 'eq', value: 'custom' },
      ui: {
        placeholder: '16px, 1.5rem, 2em',
      },
    },
    {
      key: 'text.fontWeight',
      path: 'text.fontWeight',
      domain: 'text',
      label: 'Font Weight',
      type: 'select',
      defaultValue: '400',
      ui: {
        options: [
          { label: 'Thin (100)', value: '100' },
          { label: 'Light (300)', value: '300' },
          { label: 'Regular (400)', value: '400' },
          { label: 'Medium (500)', value: '500' },
          { label: 'Semibold (600)', value: '600' },
          { label: 'Bold (700)', value: '700' },
          { label: 'Black (900)', value: '900' },
        ],
      },
    },
    {
      key: 'text.lineHeight',
      path: 'text.lineHeight',
      domain: 'text',
      label: 'Line Height',
      type: 'select',
      defaultValue: 'normal',
      ui: {
        options: [
          { label: 'Tight (1.25)', value: 'tight' },
          { label: 'Normal (1.5)', value: 'normal' },
          { label: 'Relaxed (1.75)', value: 'relaxed' },
          { label: 'Loose (2)', value: 'loose' },
          { label: 'Custom', value: 'custom' },
        ],
      },
    },
    {
      key: 'text.customLineHeight',
      path: 'text.customLineHeight',
      domain: 'text',
      label: 'Custom Line Height',
      type: 'string',
      defaultValue: '1.5',
      showWhen: { key: 'text.lineHeight', operator: 'eq', value: 'custom' },
      ui: {
        placeholder: '1.5, 24px, 1.5rem',
      },
    },
    {
      key: 'text.letterSpacing',
      path: 'text.letterSpacing',
      domain: 'text',
      label: 'Letter Spacing',
      type: 'select',
      defaultValue: 'normal',
      ui: {
        options: [
          { label: 'Tighter (-0.05em)', value: 'tighter' },
          { label: 'Tight (-0.025em)', value: 'tight' },
          { label: 'Normal (0)', value: 'normal' },
          { label: 'Wide (0.025em)', value: 'wide' },
          { label: 'Wider (0.05em)', value: 'wider' },
          { label: 'Widest (0.1em)', value: 'widest' },
          { label: 'Custom', value: 'custom' },
        ],
      },
    },
    {
      key: 'text.customLetterSpacing',
      path: 'text.customLetterSpacing',
      domain: 'text',
      label: 'Custom Letter Spacing',
      type: 'string',
      defaultValue: '0',
      showWhen: { key: 'text.letterSpacing', operator: 'eq', value: 'custom' },
      ui: {
        placeholder: '0.05em, 1px',
      },
    },
    {
      key: 'text.textAlign',
      path: 'text.textAlign',
      domain: 'text',
      label: 'Text Align',
      type: 'select',
      defaultValue: 'left',
      ui: {
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
          { label: 'Justify', value: 'justify' },
        ],
      },
    },
    {
      key: 'text.textColor',
      path: 'text.textColor',
      domain: 'text',
      label: 'Text Color',
      type: 'color',
      defaultValue: '#000000',
    },
    {
      key: 'text.textTransform',
      path: 'text.textTransform',
      domain: 'text',
      label: 'Text Transform',
      type: 'select',
      defaultValue: 'none',
      ui: {
        options: [
          { label: 'None', value: 'none' },
          { label: 'Uppercase', value: 'uppercase' },
          { label: 'Lowercase', value: 'lowercase' },
          { label: 'Capitalize', value: 'capitalize' },
        ],
      },
    },
    {
      key: 'text.textDecoration',
      path: 'text.textDecoration',
      domain: 'text',
      label: 'Text Decoration',
      type: 'select',
      defaultValue: 'none',
      ui: {
        options: [
          { label: 'None', value: 'none' },
          { label: 'Underline', value: 'underline' },
          { label: 'Line Through', value: 'line-through' },
          { label: 'Overline', value: 'overline' },
        ],
      },
    },
  ],
};

// --- Overlay Section ---
export const overlaySection: FrameSchemaSection = {
  domain: 'overlay',
  label: 'Overlay',
  icon: 'Layers',
  collapsed: false,
  schemas: [
    {
      key: 'overlay.enabled',
      path: 'overlay.enabled',
      domain: 'overlay',
      label: 'Enable Overlay',
      type: 'boolean',
      defaultValue: false,
      ui: {
        helpText: 'Make this frame an overlay (modal, dropdown, tooltip, etc.)',
      },
    },
    {
      key: 'overlay.modal',
      path: 'overlay.modal',
      domain: 'overlay',
      label: 'Modal',
      type: 'boolean',
      defaultValue: false,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        helpText: 'Block interaction with content behind overlay',
      },
    },
    {
      key: 'overlay.dismissOnClickOutside',
      path: 'overlay.dismissOnClickOutside',
      domain: 'overlay',
      label: 'Dismiss on Click Outside',
      type: 'boolean',
      defaultValue: true,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        helpText: 'Close overlay when clicking outside',
      },
    },
    {
      key: 'overlay.dismissOnEscape',
      path: 'overlay.dismissOnEscape',
      domain: 'overlay',
      label: 'Dismiss on Escape',
      type: 'boolean',
      defaultValue: true,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        helpText: 'Close overlay when pressing Escape key',
      },
    },
    {
      key: 'overlay.closeOnTriggerClick',
      path: 'overlay.closeOnTriggerClick',
      domain: 'overlay',
      label: 'Close on Trigger Click',
      type: 'boolean',
      defaultValue: true,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        helpText: 'Close overlay when clicking trigger again',
      },
    },
    {
      key: 'overlay.trapFocus',
      path: 'overlay.trapFocus',
      domain: 'overlay',
      label: 'Trap Focus',
      type: 'boolean',
      defaultValue: true,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        helpText: 'Keep keyboard focus within overlay (accessibility)',
      },
    },
    {
      key: 'overlay.animationEnter',
      path: 'overlay.animationEnter',
      domain: 'overlay',
      label: 'Enter Animation',
      type: 'select',
      defaultValue: 'fade',
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        options: [
          { label: 'None', value: 'none' },
          { label: 'Fade', value: 'fade' },
          { label: 'Scale', value: 'scale' },
          { label: 'Slide Up', value: 'slide-up' },
          { label: 'Slide Down', value: 'slide-down' },
          { label: 'Slide Left', value: 'slide-left' },
          { label: 'Slide Right', value: 'slide-right' },
        ],
        helpText: 'Animation when overlay opens',
      },
    },
    {
      key: 'overlay.animationExit',
      path: 'overlay.animationExit',
      domain: 'overlay',
      label: 'Exit Animation',
      type: 'select',
      defaultValue: 'fade',
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        options: [
          { label: 'None', value: 'none' },
          { label: 'Fade', value: 'fade' },
          { label: 'Scale', value: 'scale' },
          { label: 'Slide Up', value: 'slide-up' },
          { label: 'Slide Down', value: 'slide-down' },
          { label: 'Slide Left', value: 'slide-left' },
          { label: 'Slide Right', value: 'slide-right' },
        ],
        helpText: 'Animation when overlay closes',
      },
    },
    {
      key: 'overlay.animationDuration',
      path: 'overlay.animationDuration',
      domain: 'overlay',
      label: 'Animation Duration (ms)',
      type: 'number',
      defaultValue: 200,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        min: 0,
        max: 1000,
        step: 50,
        helpText: 'Duration of enter/exit animations',
      },
    },
    {
      key: 'overlay.backdropEnabled',
      path: 'overlay.backdropEnabled',
      domain: 'overlay',
      label: 'Show Backdrop',
      type: 'boolean',
      defaultValue: false,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        helpText: 'Show backdrop behind overlay',
      },
    },
    {
      key: 'overlay.backdropColor',
      path: 'overlay.backdropColor',
      domain: 'overlay',
      label: 'Backdrop Color',
      type: 'color',
      defaultValue: 'rgba(0, 0, 0, 0.5)',
      showWhen: { key: 'overlay.backdropEnabled', operator: 'eq', value: true },
      ui: {
        helpText: 'Color of backdrop (supports transparency)',
      },
    },
    {
      key: 'overlay.backdropBlur',
      path: 'overlay.backdropBlur',
      domain: 'overlay',
      label: 'Backdrop Blur (px)',
      type: 'number',
      defaultValue: 0,
      showWhen: { key: 'overlay.backdropEnabled', operator: 'eq', value: true },
      ui: {
        min: 0,
        max: 20,
        step: 1,
        helpText: 'Blur effect on backdrop',
      },
    },
    {
      key: 'overlay.priority',
      path: 'overlay.priority',
      domain: 'overlay',
      label: 'Z-Index Priority',
      type: 'number',
      defaultValue: 0,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        min: 0,
        max: 100,
        step: 1,
        helpText: 'Base z-index priority (0 = auto)',
      },
    },
    {
      key: 'position.anchor.targetId',
      path: 'position.anchor.targetId',
      domain: 'overlay',
      label: 'Anchor to Component',
      type: 'string',
      defaultValue: '',
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        placeholder: 'Component ID',
        helpText: 'ID of trigger component to anchor to',
      },
    },
    {
      key: 'position.anchor.placement',
      path: 'position.anchor.placement',
      domain: 'overlay',
      label: 'Placement',
      type: 'select',
      defaultValue: 'bottom',
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Top Start', value: 'top-start' },
          { label: 'Top End', value: 'top-end' },
          { label: 'Bottom', value: 'bottom' },
          { label: 'Bottom Start', value: 'bottom-start' },
          { label: 'Bottom End', value: 'bottom-end' },
          { label: 'Left', value: 'left' },
          { label: 'Left Start', value: 'left-start' },
          { label: 'Left End', value: 'left-end' },
          { label: 'Right', value: 'right' },
          { label: 'Right Start', value: 'right-start' },
          { label: 'Right End', value: 'right-end' },
        ],
        helpText: 'Preferred placement relative to trigger',
      },
    },
    {
      key: 'position.anchor.offset',
      path: 'position.anchor.offset',
      domain: 'overlay',
      label: 'Offset (px)',
      type: 'number',
      defaultValue: 8,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        min: 0,
        max: 100,
        step: 1,
        helpText: 'Distance from trigger',
      },
    },
    {
      key: 'position.anchor.flip',
      path: 'position.anchor.flip',
      domain: 'overlay',
      label: 'Auto Flip',
      type: 'boolean',
      defaultValue: true,
      showWhen: { key: 'overlay.enabled', operator: 'eq', value: true },
      ui: {
        helpText: 'Automatically flip placement if no space',
      },
    },
  ],
};

// Legacy export for backward compatibility
export const contentSection = textSection;
// --- Effects Section ---
export const effectsSection: FrameSchemaSection = {
  domain: 'effects',
  label: 'Effects',
  icon: 'Sparkles',
  collapsed: false,
  schemas: [
    {
      key: 'effects.root',
      path: 'effects',
      domain: 'effects',
      label: 'Design Effects',
      type: 'effects',
      defaultValue: {},
    },
  ],
};
