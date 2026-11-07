import { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';

export const useKeyboardShortcuts = () => {
  const {
    selectComponent,
    clearSelection,
    deleteComponent,
    copyComponent,
    pasteComponent,
    duplicateComponent,
    undo,
    redo,
    selectedIds,
    pageState,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Escape to blur inputs
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }

      // Cmd/Ctrl + A to select all
      if (isMod && e.key === 'a') {
        e.preventDefault();
        if (pageState) {
          const allIds = Object.keys(pageState.components);
          allIds.forEach((id) => selectComponent(id, true));
        }
        return;
      }

      // Cmd/Ctrl + Z to undo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y to redo
      if ((isMod && e.key === 'z' && e.shiftKey) || (isMod && e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Cmd/Ctrl + C to copy
      if (isMod && e.key === 'c' && selectedIds.length > 0) {
        e.preventDefault();
        copyComponent(selectedIds[0]);
        return;
      }

      // Cmd/Ctrl + V to paste
      if (isMod && e.key === 'v') {
        e.preventDefault();
        const state = useEditorStore.getState();
        if (state.copiedComponent) {
          // Paste into selected component if it's a layout, otherwise paste into its parent
          const targetId = selectedIds[0];
          if (targetId && pageState) {
            const target = pageState.components[targetId];
            const isLayout = ['frame'].includes(target?.type || '');
            if (isLayout) {
              pasteComponent(targetId);
            } else if (target?.parentId) {
              pasteComponent(target.parentId);
            }
          } else if (pageState) {
            // Paste at root level
            pasteComponent(null);
          }
        }
        return;
      }

      // Cmd/Ctrl + D to duplicate
      if (isMod && e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        duplicateComponent(selectedIds[0]);
        return;
      }

      // Delete/Backspace to delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        const state = useEditorStore.getState();
        selectedIds.forEach((id) => {
          const component = state.pageState?.components[id];
          if (component && !component.isLocked) {
            deleteComponent(id);
          }
        });
        return;
      }

      // Arrow keys for navigation (future enhancement)
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Could implement sibling navigation
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    clearSelection,
    selectComponent,
    deleteComponent,
    copyComponent,
    pasteComponent,
    duplicateComponent,
    undo,
    redo,
    selectedIds,
    pageState,
  ]);
};
