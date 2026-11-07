import type { LinkValue } from './schema';
import type { Fill } from './fill.types';
import type { Border } from './border.types';

// Re-export Fill and Border for convenience
export type { Fill } from './fill.types';
export type { Border } from './border.types';

// --- Layout Domain (Parent: "How I arrange my children") ---
export type LayoutType = 'stack' | 'grid';
export type StackDirection = 'vertical' | 'horizontal';
export type DistributionValue =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type AlignmentValue = 'start' | 'center' | 'end' | 'stretch';

export interface FrameLayout {
  type: LayoutType;
  direction?: StackDirection; // For stack type
  distribution?: DistributionValue; // How children are distributed along main axis
  alignment?: AlignmentValue; // How children are aligned on cross axis
  wrap?: boolean;
  gap?: number;
  padding?: number | PaddingValue; // Padding (unified number or per-side object)
  // Grid-specific
  columns?: number; // Number of columns
  rows?: number; // Number of rows
  masonry?: boolean; // Masonry layout (auto-flow rows)
}

// --- Size Domain ---
export type SizeMode = 'fixed' | 'fill' | 'fit-content' | 'auto';

export interface FrameSize {
  widthMode: SizeMode;
  width?: number;
  heightMode: SizeMode;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

// --- Position Domain ---
export type PositionType = 'relative' | 'absolute' | 'fixed' | 'sticky';

export interface FramePosition {
  type: PositionType;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  anchor?: FrameAnchor; // Anchor positioning for overlays
}

// --- Shadow Types ---
export type ShadowType = 'box' | 'realistic';
export type ShadowPosition = 'outside' | 'inside';

// Base shadow interface with common properties
interface BaseShadow {
  type: ShadowType;
  position: ShadowPosition;
  color: string; // Hex color with opacity (e.g., #00000080 for 50% opacity)
  x: number; // Horizontal offset (px)
  y: number; // Vertical offset (px)
  enabled: boolean; // Whether shadow is active
}

// Box shadow specific properties
export interface BoxShadow extends BaseShadow {
  type: 'box';
  blur: number; // Blur radius (px) - for box shadows
  spread: number; // Spread radius (px) - for box shadows
}

// Realistic shadow specific properties
export interface RealisticShadow extends BaseShadow {
  type: 'realistic';
  diffusion: number; // Diffusion/blur radius (px) - for realistic shadows
  focus: number; // Focus/spread radius (px) - for realistic shadows
  layers?: RealisticShadow[]; // Multiple shadow layers for realistic effect
}

// Union type for all shadow types
export type Shadow = BoxShadow | RealisticShadow;

// --- Style Domain ---
export interface FrameStyle {
  visible?: boolean; // Visibility control
  fill?: Fill;
  border?: Border;
  borderRadius?: number; // Border radius in pixels
  shadow?: Shadow; // Shadow configuration
  opacity?: number;
  overflow?: string;
  zIndex?: number;
  placeholderColor?: string; // Placeholder text color (input-specific)
}

// --- Spacing Domain ---
export interface PaddingValue {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface FrameSpacing {
  padding?: PaddingValue;
}

// --- Semantic Domain (Universal) ---
export type SemanticTag =
  // Layout/Structure
  | 'div'
  | 'main'
  | 'header'
  | 'footer'
  | 'aside'
  | 'nav'
  | 'section'
  | 'article'
  // Content
  | 'figure'
  | 'figcaption'
  | 'blockquote'
  | 'details'
  | 'summary'
  // Interactive
  | 'button'
  | 'a'
  | 'label'
  | 'form'
  // Inline
  | 'span'
  | 'strong'
  | 'em'
  | 'mark'
  | 'code'
  // Text/Headings
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p';

export interface FrameSemantic {
  tag: SemanticTag;
  role?: string; // ARIA role override
  ariaLabel?: string; // aria-label
  ariaDescribedBy?: string; // aria-describedby (space-separated IDs)
  ariaLabelledBy?: string; // aria-labelledby (space-separated IDs)
  ariaHidden?: boolean; // aria-hidden
}

// --- Interaction Domain (Conditional) ---
export type ButtonType = 'button' | 'submit' | 'reset';
export type LinkTarget = '_blank' | '_self' | '_parent' | '_top';

export interface FrameInteraction {
  // Button-specific
  type?: ButtonType; // Only for tag='button'
  disabled?: boolean;
  loading?: boolean;

  // Link-specific
  href?: LinkValue; // Link value object (for tag='a')
  target?: LinkTarget;
  rel?: string;
  download?: string; // For download links

  // Overlay trigger
  triggersOverlay?: string; // ID of overlay to trigger
  triggerEvent?: 'click' | 'hover' | 'focus'; // Event that triggers overlay

  // Event handlers (editor/runtime metadata)
  onClick?: string;
  onSubmit?: string;
}

// --- Text Domain (Text-specific) ---
export interface FrameText {
  // Text content
  text?: string;

  // Typography
  fontFamily?: string;
  fontSize?: string; // Preset: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, custom
  customFontSize?: string;
  fontWeight?: string; // 100, 300, 400, 500, 600, 700, 900
  lineHeight?: string; // Preset: tight, normal, relaxed, loose, custom
  customLineHeight?: string;
  letterSpacing?: string; // Preset: tighter, tight, normal, wide, wider, widest, custom
  customLetterSpacing?: string;

  // Text styling
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  direction?: 'ltr' | 'rtl' | 'auto';
}

// --- Basicons Domain ---
export interface Basicons {
  icon: string;
  color?: string;
  width?: string;
}

// --- Link Domain (Text-specific) ---
export interface Link {
  linkTo?: LinkValue; // Link destination
}

// --- Form Domain (Form-specific) ---
export interface FormDomain {
  sendTo?: string; // Form submission target (internal form ID URL or external URL)
  redirect?: string; // Optional redirect URL after successful submission
}

// --- Input Domain (Input-specific) ---
export type InputType = 'text' | 'textarea' | 'email' | 'number' | 'phone' | 'url';

export interface InputDomain {
  type: InputType; // Input field type
  name: string; // Input name attribute
  placeholder?: string; // Placeholder text
  required?: boolean; // Whether field is required
  resizable?: boolean; // Only for textarea - whether it's resizable
}

// --- Assistant Domain (AI Chat Assistant) ---
export interface AssistantDomain {
  // Appearance Tokens (optional overrides for internal UI)
  accentColor?: string; // Primary action color (send button, user bubble) — defaults to theme primary
  assistantBubbleColor?: string; // Assistant message background — defaults to theme secondary
  userBubbleColor?: string; // User message background — defaults to accentColor
  fontFamily?: string; // Chat text font — defaults to inherited
  inputPlaceholder?: string; // Placeholder text for the input bar
  headerTitle?: string; // Title shown in chat header (e.g., "Ask us anything")
  toggleIcon?: string; // Lucide icon name for the collapsed state
  toggleIconSize?: number; // Size of the toggle icon
  toggleButtonColor?: string; // Background color of toggle button
  toggleIconColor?: string; // Color of the toggle icon
}

// --- Overlay Domain ---
export type AnimationPreset =
  | 'fade'
  | 'scale'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'none';

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface FrameAnchor {
  targetId: string; // ID of the trigger component
  placement: Placement; // Preferred placement relative to trigger
  offset?: number; // Distance from trigger in pixels
  flip?: boolean; // Auto-flip if no space
}

export interface FrameOverlay {
  // Core
  enabled: boolean; // Is this frame an overlay?

  // Behavior (flattened - no nesting)
  modal: boolean;
  dismissOnClickOutside: boolean;
  dismissOnEscape: boolean;
  closeOnTriggerClick: boolean;
  trapFocus: boolean;

  // Animation (flattened)
  animationEnter: AnimationPreset;
  animationExit: AnimationPreset;
  animationDuration: number; // ms

  // Backdrop (flattened)
  backdropEnabled: boolean;
  backdropColor: string; // rgba
  backdropBlur: number; // px

  // Z-Index (explicit precedence)
  priority: number; // Base priority (see resolution rules)
}

// --- Transform Types ---
export interface Transform2D {
  rotate?: number; // degrees
}

export interface Transform3D {
  rotateX?: number; // degrees
  rotateY?: number; // degrees
  rotateZ?: number; // degrees
}

export interface SkewTransform {
  skewX?: number; // degrees
  skewY?: number; // degrees
}

// --- Transition Types ---
export type TransitionMode = 'spring' | 'ease';
export type SpringBasis = 'time' | 'physics';
export type EasePreset =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'back-in'
  | 'back-out'
  | 'back-in-out'
  | 'custom-bezier'; // Custom bezier curve option

export interface SpringTimeTransition {
  mode: 'spring';
  basis: 'time';
  duration: number; // seconds (decimal)
  bounce: number; // 0-1 (decimal)
  delay: number; // seconds (decimal)
}

export interface SpringPhysicsTransition {
  mode: 'spring';
  basis: 'physics';
  stiffness: number; // 0-1000
  damping: number; // 0-100
  mass: number; // 0.1-10 (decimal)
  delay: number; // seconds (decimal)
}

export interface EaseTransition {
  mode: 'ease';
  preset: EasePreset;
  bezier?: string; // Only used when preset is 'custom-bezier', e.g., "0.15, 0.45, 0.15, 1.35"
  duration: number; // seconds (decimal)
  delay: number; // seconds (decimal)
}

export type Transition = SpringTimeTransition | SpringPhysicsTransition | EaseTransition;

// --- Effect State (Shared by all interaction states) ---
export interface EffectState {
  opacity?: number; // 0-1 (decimal)
  scale?: number; // 0-10 (decimal)
  rotate?: Transform2D | Transform3D;
  skew?: SkewTransform;
  fill?: Fill; // Reuse existing fill system
  shadow?: Shadow; // Reuse existing shadow system
  transition: Transition;
}

// --- Base State Configuration (Reusable) ---
export interface EffectStateConfig {
  enabled: boolean;
  state: EffectState;
}

// --- Interaction States ---
export interface EffectStates {
  hover?: EffectStateConfig;
  press?: EffectStateConfig;
  focus?: EffectStateConfig; // NEW: Focus state for accessibility
  appear?: EffectStateConfig & {
    repeat?: boolean; // Repeat animation when re-entering viewport
    threshold?: number; // 0-1, percentage of element visible to trigger
  };
}

// --- Loop System ---
export interface LoopSystem {
  enabled: boolean;
  type: 'rotate' | 'scale' | 'position';
  duration: number; // seconds
  easing: EasePreset;
  offScreen: 'play' | 'pause'; // Animation behavior when element is off screen
  // Type-specific properties
  rotateDegrees?: number; // for type: 'rotate'
  scaleFrom?: number; // for type: 'scale'
  scaleTo?: number;
  positionX?: number; // for type: 'position'
  positionY?: number;
}

// --- Ticker System ---
export interface TickerSystem {
  enabled: boolean;
  speed: number; // percentage (0-100)
  hover: number; // relative modifier percentage (-100 to 100)
  direction: 'left' | 'right';
  draggable: boolean; // allow user to drag/scroll
}

// --- Scroll System ---
export type ScrollEffectType = 'animation' | 'speed' | 'transform';

export interface ScrollAnimation {
  type: 'animation';
  property: 'opacity' | 'scale' | 'rotate' | 'translateX' | 'translateY';
  from: number;
  to: number;
  start: number; // scroll progress 0-100%
  end: number; // scroll progress 0-100%
}

export interface ScrollSpeed {
  type: 'speed';
  multiplier: number; // 0.1-5, affects scroll speed
}

export interface ScrollTransform {
  type: 'transform';
  translateX?: number; // parallax X
  translateY?: number; // parallax Y
  scale?: number;
  rotate?: number;
  opacity?: number;
}

export type ScrollEffectConfig = ScrollAnimation | ScrollSpeed | ScrollTransform;

export interface ScrollSystem {
  enabled: boolean;
  config: ScrollEffectConfig;
}

// --- Environment-Driven Systems ---
export interface EffectSystems {
  loop?: LoopSystem;
  ticker?: TickerSystem;
  scroll?: ScrollSystem;
}

// --- Complete Effects Domain (Properly Separated) ---
export interface FrameEffects {
  states?: EffectStates; // Interaction-triggered visual states
  systems?: EffectSystems; // Environment/time-driven animations
}

// --- Complete Frame ---
export interface FrameProps {
  layout: FrameLayout; // "How I arrange my children"
  size: FrameSize;
  position: FramePosition;
  spacing: FrameSpacing;
  style: FrameStyle;
  semantic?: FrameSemantic; // NEW: Optional semantic HTML
  interaction?: FrameInteraction; // NEW: Optional interaction behaviors
  text?: FrameText; // NEW: Optional text content and typography
  basicons?: Basicons; // NEW: Basicons domain
  link?: Link; // NEW: Link domain (text-specific)
  form?: FormDomain; // NEW: Form domain (form-specific)
  input?: InputDomain; // NEW: Input domain (input-specific)
  assistant?: AssistantDomain; // NEW: Assistant domain (AI chat assistant)
  overlay?: FrameOverlay; // NEW: Overlay domain
  effects?: FrameEffects; // NEW: Effects domain
}

// Default empty frame
export const DEFAULT_FRAME: FrameProps = {
  layout: {
    type: 'stack',
    direction: 'vertical',
    distribution: 'start',
    alignment: 'start',
    wrap: false,
    gap: 0,
    padding: 0,
  },
  size: {
    widthMode: 'auto',
    heightMode: 'auto',
  },
  position: { type: 'relative' },
  spacing: {},
  style: {},
  semantic: { tag: 'div' }, // Default to semantic div
  interaction: undefined, // No interaction by default
};
