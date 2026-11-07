import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { EditorLayout } from './components/layout/EditorLayout';
import { Canvas } from './components/canvas/Canvas';
import { IframeRenderer } from './components/canvas/IframeRenderer';
import { useEditorStore } from './store/editorStore';
import { useEffectsRuntime } from '@canvasly/components';
import { mockPageState } from './store/mockData';
import { usePageSync } from './hooks/usePageSync';
import { ThemeProvider } from './contexts/ThemeContext';
import { pageApi } from './lib/api';
import type { DropIntent } from '@canvasly/dsl-schema';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  Type as TypeIcon,
  Square,
  CreditCard,
  Heading1,
  Heading2,
  Heading3,
  Tag,
  Image as ImageIcon,
  FileText,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Link as LinkIcon,
} from 'lucide-react';

const COMPONENT_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  // Layout components
  frame: Square,
  container: Square,
  card: CreditCard,
  // UI components
  image: ImageIcon,
  // Interactive components
  form: FileText,
  // Text components (for drag overlay)
  'heading-1': Heading1,
  'heading-2': Heading2,
  'heading-3': Heading3,
  paragraph: TypeIcon,
  label: Tag,
  // Input components (for drag overlay)
  'input-text': TypeIcon,
  'input-textarea': AlignLeft,
  'input-email': Mail,
  'input-number': Hash,
  'input-phone': Phone,
  'input-url': LinkIcon,
};

function EditorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = searchParams.get('pageId');
  const siteId = searchParams.get('siteId');

  const setPageState = useEditorStore((state) => state.setPageState);
  const setPageId = useEditorStore((state) => state.setPageId);
  const addComponent = useEditorStore((state) => state.addComponent);
  const setIsDragging = useEditorStore((state) => state.setIsDragging);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeType, setActiveType] = React.useState<string | null>(null);
  const [activePresetId, setActivePresetId] = React.useState<string | null>(null);
  const [isLoadingHomepage, setIsLoadingHomepage] = React.useState(false);
  const [homepageError, setHomepageError] = React.useState<string | null>(null);
  useKeyboardShortcuts();

  // Use page sync hook for API integration
  const { isLoading, isSaving, error, lastSaved, saveNow } = usePageSync(pageId);

  // Initialize effects runtime
  useEffectsRuntime();

  // Handle case where siteId is provided but pageId is not - redirect to homepage
  useEffect(() => {
    const fetchHomepage = async () => {
      if (siteId && !pageId) {
        setIsLoadingHomepage(true);
        setHomepageError(null);
        try {
          const pages = await pageApi.list(siteId);

          // Find the homepage (slug === 'home')
          const homepage = pages.find((p: { slug: string }) => p.slug === 'home');

          if (homepage) {
            // Redirect to the homepage by updating URL params
            setSearchParams({ siteId, pageId: homepage.id });
          } else if (pages.length > 0) {
            // Fallback to first page if no homepage found
            setSearchParams({ siteId, pageId: pages[0].id });
          } else {
            setHomepageError('No pages found for this site');
          }
        } catch (err) {
          setHomepageError(err instanceof Error ? err.message : 'Failed to load homepage');
        } finally {
          setIsLoadingHomepage(false);
        }
      }
    };

    fetchHomepage();
  }, [siteId, pageId, setSearchParams]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveType(event.active.data.current?.componentType);
    setActivePresetId(event.active.data.current?.presetId);
    setIsDragging(true);
  };

  const [dropTarget, setDropTarget] = React.useState<DropIntent | null>(null);
  const [dragPosition, setDragPosition] = React.useState<{ x: number; y: number } | null>(null);

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, active } = event;
    if (over && over.id === 'canvas-root-target') {
      const rect = active.rect.current.translated;
      if (rect) {
        setDragPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    } else {
      setDragPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);
    setActivePresetId(null);
    setIsDragging(false);
    setDragPosition(null);

    if (over && over.id === 'canvas-root-target') {
      const componentType = active.data.current?.componentType;
      const presetId = active.data.current?.presetId;
      if (componentType && dropTarget) {
        addComponent(componentType, dropTarget, presetId);
        setDropTarget(null);
      }
    }
  };

  const setSiteId = useEditorStore((state) => state.setSiteId);

  useEffect(() => {
    if (pageId) {
      setPageId(pageId);
    }
    if (siteId) {
      setSiteId(siteId);
    }
    // Only initialize with mock data if no pageId is provided
    if (!pageId && !siteId) {
      setPageState(mockPageState);
    }
  }, [setPageState, setPageId, setSiteId, pageId, siteId]);

  const ActiveIcon = activePresetId
    ? COMPONENT_ICONS[activePresetId] || COMPONENT_ICONS[activeType || '']
    : activeType
      ? COMPONENT_ICONS[activeType]
      : null;

  // Helper to get formatted name for active item
  const getActiveName = () => {
    if (!activeType) return '';
    if (activePresetId) {
      return activePresetId
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
    }
    if (activeId?.includes('bento-')) return 'Bento';
    return activeType;
  };

  // Show loading state for homepage redirect
  if (isLoadingHomepage) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading homepage...</p>
        </div>
      </div>
    );
  }

  // Show error for homepage loading
  if (homepageError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Failed to Load Homepage</h2>
          <p className="text-gray-400 mb-4">{homepageError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading page...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && pageId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Failed to Load Page</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider siteId={siteId}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <EditorLayout isSaving={isSaving} lastSaved={lastSaved} onSave={saveNow}>
          <Canvas
            dragPosition={dragPosition}
            draggedType={activeType}
            onDropTargetChange={setDropTarget}
          />
        </EditorLayout>
        <DragOverlay>
          {activeId && activeType && ActiveIcon ? (
            <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-blue-500 bg-[#2a2a2a] shadow-2xl scale-110 opacity-80 cursor-grabbing">
              <div className="w-10 h-10 rounded bg-[#111] flex items-center justify-center mb-2 text-blue-400">
                <ActiveIcon size={20} />
              </div>
              <span className="text-xs font-medium text-gray-300 uppercase">{getActiveName()}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function PreviewPage() {
  useEffectsRuntime();
  return <IframeRenderer />;
}

export default App;
