import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useEditorStore } from '../../store/editorStore';
import { SelectionOverlay } from './SelectionOverlay';
import { ResizeHandles } from './ResizeHandles';
import { DragManager } from './DragManager';
import { SaveComponentModal } from '../modals/SaveComponentModal';

interface SelectionManagerProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export const SelectionManager: React.FC<SelectionManagerProps> = ({ iframeRef }) => {
  const {
    selectedIds,
    pageState,
    duplicateComponent,
    deleteComponent,
    lockComponent,
    unlockComponent,
    moveComponentUp,
    moveComponentDown,
    copyComponent,
    pasteComponent,
    copiedComponent,
    resizeComponent,
    updateFrameProps,
    saveComponentToLibrary,
  } = useEditorStore();

  const [overlayContainer, setOverlayContainer] = useState<HTMLElement | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [componentToSave, setComponentToSave] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    // Enable overlay in iframe
    iframe.contentWindow.postMessage({ type: 'SHOW_OVERLAY', show: true }, '*');

    const updateContainer = () => {
      if (!iframe.contentDocument) return;

      const container = iframe.contentDocument.getElementById('selection-overlay-root');
      if (container) {
        setOverlayContainer(container);
      } else {
        rafRef.current = requestAnimationFrame(updateContainer);
      }
    };

    // If we don't have a container or it's been detached, find it
    if (!overlayContainer || !overlayContainer.isConnected) {
      updateContainer();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [iframeRef, selectedIds, overlayContainer]);

  // Modal handlers - defined before early return so they're always available
  const handleSaveToLibrary = (componentId: string) => {
    setComponentToSave(componentId);
    setSaveModalOpen(true);
  };

  const handleSaveModalClose = () => {
    setSaveModalOpen(false);
    setComponentToSave(null);
  };

  const handleSaveModalSave = async (name: string, description?: string, tags?: string[]) => {
    if (!componentToSave) return;

    await saveComponentToLibrary(componentToSave, { name, description, tags });
    // Show success notification after successful save
    alert(`Component "${name}" saved to library successfully!`);
  };

  // Early return if no selection, but still render modal if it's open
  if (!pageState || selectedIds.length === 0 || !overlayContainer) {
    return (
      <>
        {componentToSave && (
          <SaveComponentModal
            isOpen={saveModalOpen}
            componentId={componentToSave}
            onClose={handleSaveModalClose}
            onSave={handleSaveModalSave}
          />
        )}
      </>
    );
  }

  const selectedId = selectedIds[0]; // For now, handle single selection
  const component = pageState.components[selectedId];

  if (!component) return null;

  // Determine if component is resizable per axis
  // Frames and buttons: both dimensions
  const resizableConfig = (() => {
    switch (component.type) {
      case 'button':
      case 'frame':
        return { horizontal: true, vertical: true };
      default:
        return { horizontal: false, vertical: false };
    }
  })();

  const handleDrag = (newTop: number, newLeft: number) => {
    // Update position with new absolute values
    updateFrameProps(selectedId, 'position.top', Math.round(newTop));
    updateFrameProps(selectedId, 'position.left', Math.round(newLeft));
  };

  return (
    <>
      {ReactDOM.createPortal(
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <SelectionOverlay
            selectedId={selectedId}
            component={component}
            iframeDocument={overlayContainer.ownerDocument}
            onDuplicate={duplicateComponent}
            onDelete={deleteComponent}
            onLock={lockComponent}
            onUnlock={unlockComponent}
            onMoveUp={moveComponentUp}
            onMoveDown={moveComponentDown}
            onCopy={copyComponent}
            onPaste={pasteComponent}
            hasCopiedComponent={!!copiedComponent}
            onSaveToLibrary={handleSaveToLibrary}
          />

          <DragManager
            selectedId={selectedId}
            component={component}
            iframeDocument={overlayContainer.ownerDocument}
            onDrag={handleDrag}
          />

          {!component.isLocked && (
            <ResizeHandles
              selectedId={selectedId}
              iframeDocument={overlayContainer.ownerDocument}
              onResize={resizeComponent}
              resizable={resizableConfig}
            />
          )}
        </div>,
        overlayContainer,
      )}

      {/* Save Component Modal - rendered in main document */}
      {componentToSave && (
        <SaveComponentModal
          isOpen={saveModalOpen}
          componentId={componentToSave}
          onClose={handleSaveModalClose}
          onSave={handleSaveModalSave}
        />
      )}
    </>
  );
};
