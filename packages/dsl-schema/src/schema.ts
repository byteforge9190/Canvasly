import type { FrameSchema } from './frame.schema';
import type { FrameProps } from './frame.types';

export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'color'
  | 'select'
  | 'multiselect'
  | 'image'
  | 'video'
  | 'link'
  | 'richtext'
  | 'spacing'
  | 'icon'
  | 'json'
  | 'form-picker'
  | 'fill'
  | 'border'
  | 'padding'
  | 'shadow'
  | 'array'
  | 'effects';

export interface SelectOption {
  label: string;
  value: string | number;
}

// Link field value structure
export interface LinkValue {
  type: 'page' | 'url' | 'anchor' | 'email' | 'phone';

  // For type: 'page'
  pageId?: string;

  // For type: 'url'
  url?: string;

  // For type: 'anchor'
  anchor?: string;

  // For type: 'email'
  email?: string;
  subject?: string;

  // For type: 'phone'
  phone?: string;

  // Common options
  openInNewTab?: boolean;
  rel?: string;
}

// Array field UI configuration
export interface ArrayFieldUIConfig extends PropertyUIConfig {
  itemLabel?: string;
  addButtonText?: string;
  collapsible?: boolean;
  reorderable?: boolean;
  maxItems?: number;
  maxDepth?: number;
}

export interface PropertyUIConfig {
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
  rows?: number;
  // Array-specific UI config
  itemLabel?: string;
  addButtonText?: string;
  collapsible?: boolean;
  reorderable?: boolean;
  maxItems?: number;
  maxDepth?: number;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message?: string;
  validator?: string; // Name of custom validator function
}

export interface VisibilityCondition {
  key: string;
  operator: 'eq' | 'neq' | 'contains' | 'exists';
  value?: unknown;
}

export interface PropertySchema {
  key: string;
  label: string;
  type: PropertyType;
  defaultValue: unknown;
  group?: string;
  path?: string; // NEW: dot-path into FrameProps, e.g. "layout.gap"
  domain?:
    | 'layout'
    | 'size'
    | 'position'
    | 'spacing'
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
    | 'effects'; // NEW: effects domain
  showWhen?: VisibilityCondition;
  validation?: ValidationRule[];
  ui?: PropertyUIConfig;
  hidden?: boolean;
  // For array type
  itemSchema?: PropertySchema[];
}

export type ComponentCategory = 'layout' | 'ui' | 'media' | 'interactive' | 'form' | 'data';

export interface ComponentDefinition {
  type: string;
  name: string;
  category: ComponentCategory;
  icon: string;
  acceptsChildren: boolean;
  allowedChildTypes?: string[];
  maxChildren?: number;
  frameSchema?: FrameSchema; // NEW: Structured visual props
  defaultFrame?: FrameProps; // NEW: Default frame values
}
