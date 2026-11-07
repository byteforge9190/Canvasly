import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import type {
  NormalizedPageState,
  DropIntent,
  Component,
  Breakpoint,
  FrameProps,
  FramePreset,
  ComponentContext,
  RecursivePartial,
} from '@canvasly/dsl-schema';
import {
  getComponentDefinition,
  applyFrameMutations,
  setByPath,
  DEFAULT_FRAME,
  FRAME_PRESETS,
  BUTTON_FRAME_PRESETS,
  createButtonChildren,
  deepMerge,
} from '@canvasly/dsl-schema';
import { produce, enablePatches, produceWithPatches } from 'immer';
import { useHistoryStore } from './historyStore';
import { extractComponentTree, regenerateComponentIds } from '../lib/componentUtils';
import type { UpdateComponentInput } from '../types/component';

// Enable Immer patches
enablePatches();

// Autosave configuration
const AUTOSAVE_DELAY_MS = 2000;
let autosaveTimeout: ReturnType<typeof setTimeout> | null = null;

interface EditorState {
  // Page Data
  pageState: NormalizedPageState | null;
  pageId: string | null;
  siteId: string | null;

  // UI State
  selectedIds: string[];
  hoveredId: string | null;
  draggedId: string | null;
  isDragging: boolean;
  copiedComponent: Component | null;
  _copiedComponentsMap: Record<string, Component> | null;

  // Viewport State
  device: 'desktop' | 'tablet' | 'mobile';
  activeLocale: import('@canvasly/dsl-schema').Locale;
  defaultLocale: import('@canvasly/dsl-schema').Locale;
  supportedLocales: import('@canvasly/dsl-schema').Locale[];
  zoom: number;
  showGrid: boolean;

  // Sidebar panel state
  leftPanel: 'palette' | 'layers' | 'ai';
  rightPanel: 'properties' | 'history';

  // Version tracking for optimistic locking
  pageVersion: number;
  lastSyncedVersion: number;
  isSaving: boolean;
  hasConflict: boolean;
  conflictVersion: number | null;

  // Component Library State
  componentLibrary: {
    components: import('../types/component').ComponentListItem[];
    isLoading: boolean;
    error: string | null;
  };

  // Actions
  setPageState: (state: NormalizedPageState, recordHistory?: boolean) => void;
  setPageId: (id: string | null) => void;
  setSiteId: (id: string | null) => void;
  selectComponent: (id: string | null, multi?: boolean) => void;
  clearSelection: () => void;
  hoverComponent: (id: string | null) => void;
  setDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  setActiveLocale: (locale: import('@canvasly/dsl-schema').Locale) => void;
  setDefaultLocale: (locale: import('@canvasly/dsl-schema').Locale) => void;
  setSupportedLocales: (locales: import('@canvasly/dsl-schema').Locale[]) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setIsDragging: (isDragging: boolean) => void;
  setLeftPanel: (panel: 'palette' | 'layers' | 'ai') => void;
  setRightPanel: (panel: 'properties' | 'history') => void;

  // Component Actions
  addComponent: (type: string, intent: DropIntent, presetId?: string) => void;
  moveComponent: (id: string, intent: DropIntent) => void;
  deleteComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Record<string, unknown>) => void;
  updateFrameProps: (id: string, path: string, value: unknown, breakpoint?: Breakpoint) => void;
  batchUpdateFrame: (
    id: string,
    mutations: Record<string, unknown>,
    breakpoint?: Breakpoint,
  ) => void;

  // Copy/Paste Actions
  copyComponent: (id: string) => void;
  pasteComponent: (targetId: string | null) => void;

  // Duplicate Action
  duplicateComponent: (id: string) => void;

  // Lock/Unlock Actions
  lockComponent: (id: string) => void;
  unlockComponent: (id: string) => void;

  // Move Actions
  moveComponentUp: (id: string) => void;
  moveComponentDown: (id: string) => void;

  // Resize Action
  resizeComponent: (id: string, width: number | null, height: number | null) => void;

  // Rename Action
  renameComponent: (id: string, name: string) => void;
  addSectionTemplate: (
    template: import('../types/templates').TemplateWithContent,
    intent: DropIntent,
  ) => void;

  // Component Library Actions
  loadComponentLibrary: (siteId: string) => Promise<void>;
  saveComponentToLibrary: (
    componentId: string,
    input: { name: string; description?: string; tags?: string[] },
  ) => Promise<void>;
  insertComponentFromLibrary: (componentId: string, intent: DropIntent) => Promise<void>;
  deleteComponentFromLibrary: (componentId: string) => Promise<void>;
  duplicateComponentInLibrary: (componentId: string) => Promise<void>;
  updateComponentMetadata: (
    componentId: string,
    input: import('../types/component').UpdateComponentInput,
  ) => Promise<void>;

  // History Actions
  undo: () => void;
  redo: () => void;

  // Version/Sync Actions
  setConflict: (version: number) => void;
  resolveConflict: (resolution: 'overwrite' | 'reload') => void;
  markSynced: (version: number) => void;
  isPageEmpty: () => boolean;
}

// Helper to record history
const recordHistory = (
  prevState: NormalizedPageState | null,
  nextState: NormalizedPageState,
  description: string,
) => {
  if (!prevState) return;

  const historyStore = useHistoryStore.getState();
  const [, patches, inversePatches] = produceWithPatches(prevState, (draft) => {
    Object.assign(draft, nextState);
  });

  if (patches.length > 0) {
    historyStore.pushEntry({ patches, inversePatches, description });
  }
};

// Trigger autosave
const triggerAutosave = () => {
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout);
  }
  autosaveTimeout = setTimeout(() => {
    console.log('[Autosave] Would save page state here');
  }, AUTOSAVE_DELAY_MS);
};

// Generate unique ID
const generateId = () => `comp-${Math.random().toString(36).slice(2, 11)}`;

export const useEditorStore = create<EditorState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // Initial state
          pageState: null,
          pageId: null,
          siteId: null,
          selectedIds: [],
          hoveredId: null,
          draggedId: null,
          device: 'desktop',
          activeLocale: 'en' as import('@canvasly/dsl-schema').Locale,
          defaultLocale: 'en' as import('@canvasly/dsl-schema').Locale,
          supportedLocales: ['en' as import('@canvasly/dsl-schema').Locale],
          zoom: 1,
          showGrid: true,
          isDragging: false,
          copiedComponent: null,
          _copiedComponentsMap: null,
          leftPanel: 'palette',
          rightPanel: 'properties',
          pageVersion: 1,
          lastSyncedVersion: 1,
          isSaving: false,
          hasConflict: false,
          conflictVersion: null,

          // Component Library initial state
          componentLibrary: {
            components: [],
            isLoading: false,
            error: null,
          },

          // Basic setters
          setPageId: (id) => set({ pageId: id }),
          setSiteId: (id) => set({ siteId: id }),
          setPageState: (state, shouldRecordHistory = false) => {
            const prevState = get().pageState;
            if (shouldRecordHistory && prevState) {
              recordHistory(prevState, state, 'Update page state');
            }
            set({ pageState: state });
            triggerAutosave();
          },

          selectComponent: (id, multi) =>
            set((state) => {
              if (!id) return { selectedIds: [] };
              if (multi) {
                const exists = state.selectedIds.includes(id);
                return {
                  selectedIds: exists
                    ? state.selectedIds.filter((sid) => sid !== id)
                    : [...state.selectedIds, id],
                };
              }
              return { selectedIds: [id] };
            }),

          clearSelection: () => set({ selectedIds: [] }),
          hoverComponent: (id) => set({ hoveredId: id }),
          setDevice: (device) => set({ device }),
          setActiveLocale: (locale) => set({ activeLocale: locale }),
          setDefaultLocale: (locale) => set({ defaultLocale: locale }),
          setSupportedLocales: (locales) => set({ supportedLocales: locales }),
          setZoom: (zoom) => set({ zoom }),
          toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
          setIsDragging: (isDragging) => set({ isDragging }),
          setLeftPanel: (panel) => set({ leftPanel: panel }),
          setRightPanel: (panel) => set({ rightPanel: panel }),

          // Add component
          addComponent: (type, intent, presetId) => {
            const prevState = get().pageState;
            set(
              produce((state: EditorState) => {
                if (!state.pageState) return;

                const id = generateId();

                // If a preset is used, the base type is 'frame'
                const componentType = presetId ? 'frame' : type;
                const definition = getComponentDefinition(componentType);

                let defaultFrame: FrameProps = definition?.defaultFrame || DEFAULT_FRAME;

                // Merge preset frame if applicable
                if (presetId) {
                  const preset = FRAME_PRESETS.find((p: FramePreset) => p.id === presetId);
                  if (preset) {
                    defaultFrame = { ...defaultFrame, ...preset.frame };
                  } else if (presetId.startsWith('button-')) {
                    const presetKey = presetId
                      .replace('button-', '')
                      .toUpperCase() as keyof typeof BUTTON_FRAME_PRESETS;
                    const buttonPreset = BUTTON_FRAME_PRESETS[presetKey];
                    if (buttonPreset) {
                      defaultFrame = { ...defaultFrame, ...buttonPreset.frame };
                    }
                  }
                }

                // Determine component context from preset or default to generic for frames
                let componentContext: ComponentContext | undefined;
                if (presetId) {
                  const preset = FRAME_PRESETS.find((p: FramePreset) => p.id === presetId);
                  if (preset?.componentContext) {
                    componentContext = preset.componentContext;
                  } else if (presetId.startsWith('button-')) {
                    componentContext = 'button';
                  }
                } else if (componentType === 'frame') {
                  componentContext = 'generic';
                }

                const newComponent: Component = {
                  id,
                  type: componentType,
                  name: presetId
                    ? presetId
                        .split('-')
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(' ')
                    : type.charAt(0).toUpperCase() + type.slice(1),
                  parentId: null,
                  children: [],
                  order: 0,
                  frame: defaultFrame,
                  responsive: {},
                  isLocked: false,
                  componentContext,
                  metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                };

                // Create default children for Accordion components
                // (Custom logic for Form component matches user request for Webflow-like experience)
                if (type === 'form' || presetId === 'form') {
                  // Create form field components using frame presets
                  const nameLabelId = generateId();
                  const nameInputId = generateId();
                  const emailLabelId = generateId();
                  const emailInputId = generateId();
                  const messageLabelId = generateId();
                  const messageInputId = generateId();
                  const submitId = generateId();

                  // Find input and button presets
                  const textInputPreset = FRAME_PRESETS.find(
                    (p: FramePreset) => p.id === 'input-text',
                  );
                  const textareaPreset = FRAME_PRESETS.find(
                    (p: FramePreset) => p.id === 'input-textarea',
                  );
                  const emailInputPreset = FRAME_PRESETS.find(
                    (p: FramePreset) => p.id === 'input-email',
                  );
                  const submitButtonPreset = BUTTON_FRAME_PRESETS.SUBMIT;

                  // Name Label
                  const nameLabelComp: Component = {
                    id: nameLabelId,
                    type: 'frame',
                    name: 'Name Label',
                    parentId: id,
                    children: [],
                    order: 0,
                    frame: {
                      ...DEFAULT_FRAME,
                      layout: { type: 'stack', direction: 'vertical' },
                      size: { widthMode: 'auto', heightMode: 'auto' },
                      semantic: { tag: 'label' },
                      text: {
                        text: 'Name',
                        fontSize: 'sm',
                        fontWeight: '500',
                        textColor: '#374151',
                      },
                    },
                    responsive: {},
                    isLocked: false,
                    componentContext: 'text',
                    metadata: {
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  };

                  // Name Input
                  const nameInputComp: Component = {
                    id: nameInputId,
                    type: 'frame',
                    name: 'Name Input',
                    parentId: id,
                    children: [],
                    order: 1,
                    frame: textInputPreset
                      ? {
                          ...textInputPreset.frame,
                          input: {
                            type: 'text',
                            name: 'name',
                            placeholder: 'Enter your name',
                            required: true,
                          },
                        }
                      : DEFAULT_FRAME,
                    responsive: {},
                    isLocked: false,
                    componentContext: 'input',
                    metadata: {
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  };

                  // Email Label
                  const emailLabelComp: Component = {
                    id: emailLabelId,
                    type: 'frame',
                    name: 'Email Label',
                    parentId: id,
                    children: [],
                    order: 2,
                    frame: {
                      ...DEFAULT_FRAME,
                      layout: { type: 'stack', direction: 'vertical' },
                      size: { widthMode: 'auto', heightMode: 'auto' },
                      spacing: { padding: { top: 8, right: 0, bottom: 0, left: 0 } },
                      semantic: { tag: 'label' },
                      text: {
                        text: 'Email',
                        fontSize: 'sm',
                        fontWeight: '500',
                        textColor: '#374151',
                      },
                    },
                    responsive: {},
                    isLocked: false,
                    componentContext: 'text',
                    metadata: {
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  };

                  // Email Input
                  const emailInputComp: Component = {
                    id: emailInputId,
                    type: 'frame',
                    name: 'Email Input',
                    parentId: id,
                    children: [],
                    order: 3,
                    frame: emailInputPreset
                      ? {
                          ...emailInputPreset.frame,
                          input: {
                            type: 'email',
                            name: 'email',
                            placeholder: 'Enter your email',
                            required: true,
                          },
                        }
                      : DEFAULT_FRAME,
                    responsive: {},
                    isLocked: false,
                    componentContext: 'input',
                    metadata: {
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  };

                  // Message Label
                  const messageLabelComp: Component = {
                    id: messageLabelId,
                    type: 'frame',
                    name: 'Message Label',
                    parentId: id,
                    children: [],
                    order: 4,
                    frame: {
                      ...DEFAULT_FRAME,
                      layout: { type: 'stack', direction: 'vertical' },
                      size: { widthMode: 'auto', heightMode: 'auto' },
                      spacing: { padding: { top: 8, right: 0, bottom: 0, left: 0 } },
                      semantic: { tag: 'label' },
                      text: {
                        text: 'Message',
                        fontSize: 'sm',
                        fontWeight: '500',
                        textColor: '#374151',
                      },
                    },
                    responsive: {},
                    isLocked: false,
                    componentContext: 'text',
                    metadata: {
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  };

                  // Message Textarea
                  const messageInputComp: Component = {
                    id: messageInputId,
                    type: 'frame',
                    name: 'Message Input',
                    parentId: id,
                    children: [],
                    order: 5,
                    frame: textareaPreset
                      ? {
                          ...textareaPreset.frame,
                          input: {
                            type: 'textarea',
                            name: 'message',
                            placeholder: 'Enter your message',
                            required: true,
                            resizable: true,
                          },
                        }
                      : DEFAULT_FRAME,
                    responsive: {},
                    isLocked: false,
                    componentContext: 'input',
                    metadata: {
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  };

                  // Submit Button
                  const submitComp: Component = {
                    id: submitId,
                    type: 'frame',
                    name: 'Submit Button',
                    parentId: id,
                    children: [],
                    order: 6,
                    frame: submitButtonPreset ? { ...submitButtonPreset.frame } : DEFAULT_FRAME,
                    responsive: {},
                    isLocked: false,
                    componentContext: 'button',
                    metadata: {
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  };

                  // Add text content to submit button
                  if (submitButtonPreset) {
                    const textId = generateId();
                    const textComp: Component = {
                      id: textId,
                      type: 'frame',
                      name: 'Button Text',
                      parentId: submitId,
                      children: [],
                      order: 0,
                      frame: {
                        ...DEFAULT_FRAME,
                        layout: { type: 'stack', direction: 'vertical' },
                        size: { widthMode: 'auto', heightMode: 'auto' },
                        semantic: { tag: 'span' },
                        text: {
                          text: 'Submit',
                          fontSize: 'base',
                          fontWeight: '600',
                          textColor: '#ffffff',
                        },
                      },
                      responsive: {},
                      isLocked: false,
                      componentContext: 'text',
                      metadata: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      },
                    };
                    state.pageState.components[textId] = textComp;
                    submitComp.children = [textId];
                  }

                  state.pageState.components[nameLabelId] = nameLabelComp;
                  state.pageState.components[nameInputId] = nameInputComp;
                  state.pageState.components[emailLabelId] = emailLabelComp;
                  state.pageState.components[emailInputId] = emailInputComp;
                  state.pageState.components[messageLabelId] = messageLabelComp;
                  state.pageState.components[messageInputId] = messageInputComp;
                  state.pageState.components[submitId] = submitComp;
                  newComponent.children = [
                    nameLabelId,
                    nameInputId,
                    emailLabelId,
                    emailInputId,
                    messageLabelId,
                    messageInputId,
                    submitId,
                  ];
                }

                // Handle Button Frame Presets
                if (presetId && presetId.startsWith('button-')) {
                  const presetKey = presetId
                    .replace('button-', '')
                    .toUpperCase() as keyof typeof BUTTON_FRAME_PRESETS;
                  const buttonPreset = BUTTON_FRAME_PRESETS[presetKey];

                  if (buttonPreset) {
                    const children = createButtonChildren(
                      buttonPreset.childText,
                      undefined,
                      buttonPreset.textColor,
                    );
                    children.forEach((child: Component) => {
                      child.parentId = id;
                      state.pageState!.components[child.id] = child;
                      newComponent.children.push(child.id);
                    });
                  }
                }
                if (intent.type === 'beside') {
                  const targetComp = state.pageState.components[intent.targetId];
                  if (targetComp) {
                    const wrapperId = generateId();
                    const wrapper: Component = {
                      id: wrapperId,
                      type: 'frame',
                      name: 'Flex Wrapper',
                      parentId: targetComp.parentId,
                      children: intent.side === 'left' ? [id, targetComp.id] : [targetComp.id, id],
                      order: targetComp.order,
                      frame: {
                        ...DEFAULT_FRAME,
                        layout: { type: 'stack', direction: 'horizontal', gap: 20, padding: 10 },
                        spacing: {},
                      },
                      responsive: {},
                      isLocked: false,
                      metadata: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      },
                    };

                    state.pageState.components[wrapperId] = wrapper;
                    state.pageState.components[id] = newComponent;
                    newComponent.parentId = wrapperId;
                    targetComp.parentId = wrapperId;

                    const parentId = wrapper.parentId;
                    if (parentId) {
                      const parentComp = state.pageState.components[parentId];
                      if (parentComp) {
                        const idx = parentComp.children.indexOf(targetComp.id);
                        parentComp.children.splice(idx, 1, wrapperId);
                      } else {
                        // Root level
                        const idx = state.pageState.componentOrder.indexOf(targetComp.id);
                        if (idx !== -1) {
                          state.pageState.componentOrder.splice(idx, 1, wrapperId);
                        }
                      }
                    } else {
                      // No parentId means root level
                      const idx = state.pageState.componentOrder.indexOf(targetComp.id);
                      if (idx !== -1) {
                        state.pageState.componentOrder.splice(idx, 1, wrapperId);
                      }
                    }
                  }
                } else {
                  let parentId = intent.targetId;
                  let index = intent.type === 'inside' ? (intent.index ?? 0) : 0;

                  const targetComp = intent.targetId
                    ? state.pageState.components[intent.targetId]
                    : null;
                  if (targetComp && intent.type !== 'inside') {
                    parentId = targetComp.parentId;
                    const parentComp = parentId ? state.pageState.components[parentId] : null;
                    const children = parentComp
                      ? parentComp.children
                      : state.pageState.componentOrder;
                    const targetIdx = children.indexOf(intent.targetId);
                    index = intent.type === 'before' ? targetIdx : targetIdx + 1;
                  }

                  newComponent.parentId = parentId;
                  state.pageState.components[id] = newComponent;

                  const parentComp = parentId ? state.pageState.components[parentId] : null;
                  if (parentComp) {
                    parentComp.children.splice(index, 0, id);
                  } else {
                    // Root level
                    state.pageState.componentOrder.splice(index, 0, id);
                  }
                }
              }),
            );
            if (prevState && get().pageState) {
              recordHistory(prevState, get().pageState!, `Add ${type} component`);
            }
            triggerAutosave();
          },

          // Add section template
          addSectionTemplate: (template, intent) => {
            const prevState = get().pageState;
            set(
              produce((state: EditorState) => {
                if (!state.pageState || !template.content || !template.content.components) return;

                const rootId = template.content.rootComponentId;
                if (!rootId || !template.content.components[rootId]) return;

                // Regenerate IDs using shared utility
                const { newContent } = regenerateComponentIds(template.content, generateId);
                const newRootId = newContent.rootComponentId;
                const newRoot = newContent.components[newRootId];

                // Determine final parent and index
                let parentId = intent.targetId;
                let index = intent.type === 'inside' ? (intent.index ?? 0) : 0;

                const targetComp = intent.targetId
                  ? state.pageState.components[intent.targetId]
                  : null;
                if (targetComp && intent.type !== 'inside') {
                  parentId = targetComp.parentId;
                  const parentComp = parentId ? state.pageState.components[parentId] : null;
                  const children = parentComp
                    ? parentComp.children
                    : state.pageState.componentOrder;
                  const targetIdx = children.indexOf(intent.targetId);
                  index = intent.type === 'before' ? targetIdx : targetIdx + 1;
                }

                // Attach root to parent
                newRoot.parentId = parentId;

                // Add all new components to state
                Object.assign(state.pageState.components, newContent.components);

                // Add root ID to parent's children
                const parentComp = parentId ? state.pageState.components[parentId] : null;
                if (parentComp) {
                  parentComp.children.splice(index, 0, newRootId);
                } else {
                  // Root level
                  state.pageState.componentOrder.splice(index, 0, newRootId);
                }

                // Select the new root
                state.selectedIds = [newRootId];
              }),
            );

            if (prevState && get().pageState) {
              recordHistory(prevState, get().pageState!, `Add section template: ${template.name}`);
            }
            triggerAutosave();
          },

          // Move component
          moveComponent: (id, intent) => {
            const prevState = get().pageState;
            set(
              produce((state: EditorState) => {
                if (!state.pageState) return;

                const component = state.pageState.components[id];
                if (!component) return;

                const oldParentId = component.parentId;

                // Remove from old parent
                const oldParentComponent = oldParentId
                  ? state.pageState.components[oldParentId]
                  : null;
                if (oldParentComponent) {
                  oldParentComponent.children = oldParentComponent.children.filter(
                    (cid) => cid !== id,
                  );
                } else {
                  // Root level
                  state.pageState.componentOrder = state.pageState.componentOrder.filter(
                    (cid) => cid !== id,
                  );
                }

                if (intent.type === 'beside') {
                  const targetComp = state.pageState.components[intent.targetId];
                  if (targetComp) {
                    const wrapperId = generateId();
                    const wrapper: Component = {
                      id: wrapperId,
                      type: 'frame',
                      name: 'Flex Wrapper',
                      parentId: targetComp.parentId,
                      children: intent.side === 'left' ? [id, targetComp.id] : [targetComp.id, id],
                      order: targetComp.order,
                      frame: {
                        ...DEFAULT_FRAME,
                        layout: { type: 'stack', direction: 'horizontal', gap: 20, padding: 10 },
                        spacing: {},
                      },
                      responsive: {},
                      isLocked: false,
                      metadata: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      },
                    };

                    state.pageState.components[wrapperId] = wrapper;
                    component.parentId = wrapperId;
                    targetComp.parentId = wrapperId;

                    const parentId = wrapper.parentId;
                    if (parentId) {
                      const parentComp = state.pageState.components[parentId];
                      if (parentComp) {
                        const idx = parentComp.children.indexOf(targetComp.id);
                        parentComp.children.splice(idx, 1, wrapperId);
                      } else {
                        // Root level
                        const idx = state.pageState.componentOrder.indexOf(targetComp.id);
                        if (idx !== -1) {
                          state.pageState.componentOrder.splice(idx, 1, wrapperId);
                        }
                      }
                    }
                  }
                } else {
                  let parentId = intent.targetId;
                  let index = intent.type === 'inside' ? (intent.index ?? 0) : 0;

                  const targetComp = intent.targetId
                    ? state.pageState.components[intent.targetId]
                    : null;
                  if (targetComp && intent.type !== 'inside') {
                    parentId = targetComp.parentId;
                    const parentComp = parentId ? state.pageState.components[parentId] : null;
                    const children = parentComp
                      ? parentComp.children
                      : state.pageState.componentOrder;
                    const targetIdx = children.indexOf(intent.targetId);
                    index = intent.type === 'before' ? targetIdx : targetIdx + 1;
                  }

                  component.parentId = parentId;
                  const newParentComponent = parentId ? state.pageState.components[parentId] : null;
                  if (newParentComponent) {
                    newParentComponent.children.splice(index, 0, id);
                  } else {
                    // Root level
                    state.pageState.componentOrder.splice(index, 0, id);
                  }
                }
              }),
            );
            if (prevState && get().pageState) {
              recordHistory(prevState, get().pageState!, 'Move component');
            }
            triggerAutosave();
          },

          // Delete component
          deleteComponent: (id) => {
            const prevState = get().pageState;
            set(
              produce((state: EditorState) => {
                if (!state.pageState) return;

                const component = state.pageState.components[id];
                if (!component) return;

                const parentId = component.parentId;
                if (parentId) {
                  const parent = state.pageState.components[parentId];
                  if (parent) {
                    parent.children = parent.children.filter((cid) => cid !== id);
                  } else {
                    // Parent is root level
                    state.pageState.componentOrder = state.pageState.componentOrder.filter(
                      (cid) => cid !== id,
                    );
                  }
                } else {
                  // No parentId - search root level
                  state.pageState.componentOrder = state.pageState.componentOrder.filter(
                    (cid) => cid !== id,
                  );
                }

                // Collect all component IDs to delete first, then delete them
                const idsToDelete: string[] = [];
                const collectIds = (compId: string) => {
                  const comp = state.pageState!.components[compId];
                  if (comp) {
                    idsToDelete.push(compId);
                    comp.children.forEach(collectIds);
                  }
                };

                collectIds(id);
                idsToDelete.forEach((compId) => {
                  delete state.pageState!.components[compId];
                });

                state.selectedIds = state.selectedIds.filter((sid) => !idsToDelete.includes(sid));
              }),
            );
            if (prevState && get().pageState) {
              recordHistory(prevState, get().pageState!, 'Delete component');
            }
            triggerAutosave();
          },

          // Update component props
          updateComponentProps: (id, props) => {
            set(
              produce((state: EditorState) => {
                if (state.pageState && state.pageState.components[id]) {
                  const component = state.pageState.components[id];

                  Object.keys(props).forEach((key) => {
                    if (
                      key === 'responsive' &&
                      typeof props[key] === 'object' &&
                      props[key] !== null
                    ) {
                      const responsiveUpdate = props[key] as Record<
                        Breakpoint,
                        {
                          frame?: RecursivePartial<FrameProps>;
                        }
                      >;

                      (Object.keys(responsiveUpdate) as Breakpoint[]).forEach((breakpoint) => {
                        if (!component.responsive[breakpoint]) {
                          component.responsive[breakpoint] = {};
                        }

                        const bpUpdate = responsiveUpdate[breakpoint];
                        const bpOriginal = component.responsive[breakpoint]!;

                        if (bpUpdate.frame) {
                          bpOriginal.frame = deepMerge(bpOriginal.frame || {}, bpUpdate.frame);
                        }
                      });
                    }
                  });

                  component.metadata.updatedAt = new Date().toISOString();
                }
              }),
            );
            triggerAutosave();
          },

          updateFrameProps: (id: string, path: string, value: unknown, breakpoint?: Breakpoint) => {
            set(
              produce((state: EditorState) => {
                const component = state.pageState?.components[id];
                if (component) {
                  const { activeLocale, defaultLocale } = state;
                  const isDefaultLocale = activeLocale === defaultLocale;

                  if (breakpoint) {
                    // Initialize responsive object for this breakpoint if needed
                    if (!component.responsive[breakpoint]) {
                      component.responsive[breakpoint] = {};
                    }

                    // Initialize frame object for this breakpoint if needed
                    const currentFrame = component.responsive[breakpoint]!.frame || {};
                    component.responsive[breakpoint]!.frame = setByPath(currentFrame, path, value);
                  } else if (!isDefaultLocale) {
                    // Update locale override frame
                    if (!component.localized) {
                      component.localized = {};
                    }
                    if (!component.localized![activeLocale]) {
                      component.localized![activeLocale] = {};
                    }
                    const currentFrame = component.localized![activeLocale].frame || {};
                    component.localized![activeLocale].frame = setByPath(currentFrame, path, value);
                  } else {
                    // Update base frame
                    component.frame = setByPath(component.frame || DEFAULT_FRAME, path, value);
                  }
                  component.metadata.updatedAt = new Date().toISOString();
                }
              }),
            );
            triggerAutosave();
          },

          batchUpdateFrame: (
            id: string,
            mutations: Record<string, unknown>,
            breakpoint?: Breakpoint,
          ) => {
            set(
              produce((state: EditorState) => {
                const component = state.pageState?.components[id];
                if (component) {
                  const { activeLocale, defaultLocale } = state;
                  const isDefaultLocale = activeLocale === defaultLocale;

                  if (breakpoint) {
                    if (!component.responsive[breakpoint]) {
                      component.responsive[breakpoint] = {};
                    }
                    const currentFrame = component.responsive[breakpoint]!.frame || {};
                    component.responsive[breakpoint]!.frame = applyFrameMutations(
                      currentFrame,
                      mutations,
                    );
                  } else if (!isDefaultLocale) {
                    if (!component.localized) {
                      component.localized = {};
                    }
                    if (!component.localized![activeLocale]) {
                      component.localized![activeLocale] = {};
                    }
                    const currentFrame = component.localized![activeLocale].frame || {};
                    component.localized![activeLocale].frame = applyFrameMutations(
                      currentFrame,
                      mutations,
                    );
                  } else {
                    component.frame = applyFrameMutations(
                      component.frame || DEFAULT_FRAME,
                      mutations,
                    );
                  }
                  component.metadata.updatedAt = new Date().toISOString();
                }
              }),
            );
            triggerAutosave();
          },

          // Copy component (deep copy including all nested children)
          copyComponent: (id) =>
            set((state) => {
              if (!state.pageState) return {};
              const component = state.pageState.components[id];
              if (!component) return {};

              // Deep copy the component and all its descendants
              const copiedComponents: Record<string, Component> = {};

              const deepCopyComponent = (compId: string): Component | null => {
                const comp = state.pageState!.components[compId];
                if (!comp) return null;

                const cloned: Component = JSON.parse(JSON.stringify(comp));
                copiedComponents[compId] = cloned;

                // Recursively copy all children
                cloned.children.forEach((childId) => {
                  deepCopyComponent(childId);
                });

                return cloned;
              };

              const rootCloned = deepCopyComponent(id);
              if (!rootCloned) return {};

              // Store both the root component and all copied components
              return {
                copiedComponent: rootCloned,
                _copiedComponentsMap: copiedComponents,
              } as Partial<EditorState>;
            }),

          // Paste component
          pasteComponent: (targetId) => {
            const prevState = get().pageState;
            const copiedComponentsMap = get()._copiedComponentsMap;

            set(
              produce((state: EditorState) => {
                if (!state.pageState || !state.copiedComponent) return;

                // Use the stored components map, or fall back to just the copied component
                const sourceComponents: Record<string, Component> = copiedComponentsMap || {
                  [state.copiedComponent.id]: state.copiedComponent,
                };

                // Map from old IDs to new IDs
                const idMap: Record<string, string> = {};

                // First pass: generate new IDs for all components
                Object.keys(sourceComponents).forEach((oldId) => {
                  idMap[oldId] = generateId();
                });

                // Second pass: create new components with updated IDs and parent references
                const rootOldId = state.copiedComponent.id;
                const rootNewId = idMap[rootOldId];

                Object.entries(sourceComponents).forEach(([oldId, oldComp]) => {
                  const newId = idMap[oldId];
                  const isRoot = oldId === rootOldId;

                  const newComponent: Component = {
                    ...JSON.parse(JSON.stringify(oldComp)),
                    id: newId,
                    parentId: isRoot ? targetId : idMap[oldComp.parentId!] || targetId,
                    children: oldComp.children
                      .map((childId) => idMap[childId])
                      .filter((id): id is string => id !== undefined),
                    metadata: {
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  };

                  state.pageState!.components[newId] = newComponent;
                });

                // Add root component to target's children
                const parent = targetId ? state.pageState.components[targetId] : null;
                if (parent) {
                  parent.children.push(rootNewId);
                } else {
                  // Root level
                  state.pageState.componentOrder.push(rootNewId);
                }
              }),
            );
            if (prevState && get().pageState) {
              recordHistory(prevState, get().pageState!, 'Paste component');
            }
            triggerAutosave();
          },

          // Duplicate component
          duplicateComponent: (id) => {
            const prevState = get().pageState;
            set(
              produce((state: EditorState) => {
                if (!state.pageState) return;

                const component = state.pageState.components[id];
                if (!component || !component.parentId) return;

                const newId = generateId();
                const duplicated: Component = {
                  ...JSON.parse(JSON.stringify(component)),
                  id: newId,
                  name: `${component.name || component.type} (Copy)`,
                  metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                };

                state.pageState.components[newId] = duplicated;

                const updateChildIds = (comp: Component, originalChildren: string[]) => {
                  comp.children = originalChildren.map((childId) => {
                    const childComp = state.pageState!.components[childId];
                    if (childComp) {
                      const newChildId = generateId();
                      const newChildComp = {
                        ...JSON.parse(JSON.stringify(childComp)),
                        id: newChildId,
                        parentId: comp.id,
                      };
                      state.pageState!.components[newChildId] = newChildComp;
                      updateChildIds(newChildComp, childComp.children);
                      return newChildId;
                    }
                    return childId;
                  });
                };

                updateChildIds(duplicated, component.children);

                const parent = state.pageState.components[component.parentId];
                if (parent) {
                  const index = parent.children.indexOf(id);
                  parent.children.splice(index + 1, 0, newId);
                } else {
                  // Root level
                  const index = state.pageState.componentOrder.indexOf(id);
                  if (index !== -1) {
                    state.pageState.componentOrder.splice(index + 1, 0, newId);
                  }
                }

                state.selectedIds = [newId];
              }),
            );
            if (prevState && get().pageState) {
              recordHistory(prevState, get().pageState!, 'Duplicate component');
            }
            triggerAutosave();
          },

          // Lock component
          lockComponent: (id) =>
            set(
              produce((state: EditorState) => {
                if (state.pageState && state.pageState.components[id]) {
                  state.pageState.components[id].isLocked = true;
                }
              }),
            ),

          // Unlock component
          unlockComponent: (id) =>
            set(
              produce((state: EditorState) => {
                if (state.pageState && state.pageState.components[id]) {
                  state.pageState.components[id].isLocked = false;
                }
              }),
            ),

          isPageEmpty: () => {
            const { pageState } = get();
            if (!pageState) return true;
            return pageState.componentOrder.length === 0;
          },

          // Move component up
          moveComponentUp: (id) =>
            set(
              produce((state: EditorState) => {
                if (!state.pageState) return;

                const component = state.pageState.components[id];
                const parent = component.parentId
                  ? state.pageState.components[component.parentId]
                  : null;
                const children = parent ? parent.children : state.pageState.componentOrder;

                if (!children) return;

                const index = children.indexOf(id);
                if (index > 0) {
                  [children[index - 1], children[index]] = [children[index], children[index - 1]];
                }
              }),
            ),

          // Move component down
          moveComponentDown: (id) =>
            set(
              produce((state: EditorState) => {
                if (!state.pageState) return;

                const component = state.pageState.components[id];
                const parent = component.parentId
                  ? state.pageState.components[component.parentId]
                  : null;
                const children = parent ? parent.children : state.pageState.componentOrder;

                if (!children) return;

                const index = children.indexOf(id);
                if (index < children.length - 1) {
                  [children[index], children[index + 1]] = [children[index + 1], children[index]];
                }
              }),
            ),

          // Resize component
          resizeComponent: (id, width, height) =>
            set(
              produce((state: EditorState) => {
                if (state.pageState && state.pageState.components[id]) {
                  const component = state.pageState.components[id];

                  // Ensure frame exists
                  if (!component.frame) {
                    component.frame = JSON.parse(JSON.stringify(DEFAULT_FRAME));
                  }

                  // Ensure frame.size exists
                  if (!component.frame!.size) {
                    component.frame!.size = {
                      widthMode: 'auto',
                      heightMode: 'auto',
                    };
                  }

                  // Only update dimensions that were actually modified
                  if (width !== null) {
                    component.frame!.size!.widthMode = 'fixed';
                    component.frame!.size!.width = width;
                  }
                  if (height !== null) {
                    component.frame!.size!.heightMode = 'fixed';
                    component.frame!.size!.height = height;
                  }

                  component.metadata.updatedAt = new Date().toISOString();
                }
              }),
            ),

          // Rename component
          renameComponent: (id, name) =>
            set(
              produce((state: EditorState) => {
                if (state.pageState && state.pageState.components[id]) {
                  state.pageState.components[id].name = name;
                }
              }),
            ),

          // Undo
          undo: () => {
            const currentState = get().pageState;
            if (!currentState) return;

            const historyStore = useHistoryStore.getState();
            const previousState = historyStore.undo(currentState);
            if (previousState) {
              set({ pageState: previousState });
            }
          },

          // Redo
          redo: () => {
            const currentState = get().pageState;
            if (!currentState) return;

            const historyStore = useHistoryStore.getState();
            const nextState = historyStore.redo(currentState);
            if (nextState) {
              set({ pageState: nextState });
            }
          },

          // Set conflict
          setConflict: (version) =>
            set({
              hasConflict: true,
              conflictVersion: version,
            }),

          // Resolve conflict
          resolveConflict: (resolution) => {
            if (resolution === 'overwrite') {
              // Force save current state
              set({
                hasConflict: false,
                conflictVersion: null,
                pageVersion: get().pageVersion + 1,
              });
            } else {
              // Reload would be handled by the component
              set({
                hasConflict: false,
                conflictVersion: null,
              });
            }
          },

          // Mark synced
          markSynced: (version) =>
            set({
              lastSyncedVersion: version,
              pageVersion: version,
              isSaving: false,
            }),

          // Component Library Actions (in-memory mock)
          loadComponentLibrary: async () => {
            const components = get().componentLibrary.components;
            set({
              componentLibrary: {
                components,
                isLoading: false,
                error: null,
              },
            });
          },

          saveComponentToLibrary: async (
            componentId: string,
            input: { name: string; description?: string; tags?: string[] },
          ) => {
            const { pageState } = get();
            if (!pageState) {
              throw new Error('Missing page information');
            }

            const content = extractComponentTree(componentId, pageState.components);
            const newId = generateId();

            const newComponent = {
              id: newId,
              name: input.name,
              description: input.description,
              tags: input.tags || [],
              usage_count: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            set({
              componentLibrary: {
                ...get().componentLibrary,
                components: [...get().componentLibrary.components, newComponent],
              },
            });

            // Store component content locally
            localStorage.setItem(`canvasly_component_${newId}`, JSON.stringify(content));
          },

          insertComponentFromLibrary: async (componentId: string, intent: DropIntent) => {
            const { pageState } = get();
            if (!pageState) {
              throw new Error('Missing page information');
            }

            const stored = localStorage.getItem(`canvasly_component_${componentId}`);
            if (!stored) {
              throw new Error('Component content not found');
            }

            const content = JSON.parse(stored);
            const { newContent } = regenerateComponentIds(content, generateId);
            const prevPageState = pageState;

            set(
              produce((state: EditorState) => {
                if (!state.pageState) return;

                const newRootId = newContent.rootComponentId;
                const newRoot = newContent.components[newRootId];

                let parentId = intent.targetId;
                let index = intent.type === 'inside' ? (intent.index ?? 0) : 0;

                const targetComp = intent.targetId
                  ? state.pageState.components[intent.targetId]
                  : null;

                if (targetComp && intent.type !== 'inside') {
                  parentId = targetComp.parentId;
                  const parentComp = parentId ? state.pageState.components[parentId] : null;
                  const children = parentComp
                    ? parentComp.children
                    : state.pageState.componentOrder;
                  const targetIdx = children.indexOf(intent.targetId);
                  index = intent.type === 'before' ? targetIdx : targetIdx + 1;
                }

                newRoot.parentId = parentId;
                Object.assign(state.pageState.components, newContent.components);

                const parentComp = parentId ? state.pageState.components[parentId] : null;
                if (parentComp) {
                  parentComp.children.splice(index, 0, newRootId);
                } else {
                  state.pageState.componentOrder.splice(index, 0, newRootId);
                }

                state.selectedIds = [newRootId];
              }),
            );

            const newPageState = get().pageState;
            if (prevPageState && newPageState) {
              recordHistory(prevPageState, newPageState, 'Insert component from library');
            }
          },

          deleteComponentFromLibrary: async (componentId: string) => {
            set({
              componentLibrary: {
                ...get().componentLibrary,
                components: get().componentLibrary.components.filter((c) => c.id !== componentId),
              },
            });
            localStorage.removeItem(`canvasly_component_${componentId}`);
          },

          duplicateComponentInLibrary: async (componentId: string) => {
            const comp = get().componentLibrary.components.find((c) => c.id === componentId);
            if (!comp) throw new Error('Component not found');

            const newId = generateId();
            const stored = localStorage.getItem(`canvasly_component_${componentId}`);
            if (stored) {
              localStorage.setItem(`canvasly_component_${newId}`, stored);
            }

            set({
              componentLibrary: {
                ...get().componentLibrary,
                components: [
                  ...get().componentLibrary.components,
                  { ...comp, id: newId, name: `${comp.name} (Copy)` },
                ],
              },
            });
          },

          updateComponentMetadata: async (componentId: string, input: UpdateComponentInput) => {
            set({
              componentLibrary: {
                ...get().componentLibrary,
                components: get().componentLibrary.components.map((c) =>
                  c.id === componentId ? { ...c, ...input, updated_at: new Date().toISOString() } : c,
                ),
              },
            });
          },
        }),
        {
          name: 'editor-storage',
          partialize: (state) => ({
            device: state.device,
            zoom: state.zoom,
            showGrid: state.showGrid,
            leftPanel: state.leftPanel,
            rightPanel: state.rightPanel,
          }),
        },
      ),
    ),
    { name: 'EditorStore' },
  ),
);
