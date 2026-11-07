import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useHistoryStore } from '../../store/historyStore';
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
  LayoutGrid,
  History,
  Settings,
  Undo2,
  Redo2,
  HelpCircle,
  ExternalLink,
  Keyboard,
  Mail,
  Sparkles,
} from 'lucide-react';
import { ComponentPalette } from '../palette/ComponentPalette';
import { PropertyPanel } from './PropertyPanel';
import { BreadcrumbNav } from '../canvas/BreadcrumbNav';
import { LayerPanel } from '../layers/LayerPanel';
import { AIPagePanel } from '../ai/AIPagePanel';
import { HistoryPanel } from '../history/HistoryPanel';
import { ConflictModal } from '../modals/ConflictModal';
import { PublishButton } from './PublishButton';
import { ThemeQuickAccess } from './ThemeQuickAccess';
import { PageSelector } from './PageSelector';
import { LocaleSwitcher } from './LocaleSwitcher';
import { useSearchParams } from 'react-router-dom';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface EditorLayoutProps {
  children: React.ReactNode;
  isSaving?: boolean;
  lastSaved?: Date | null;
  onSave?: () => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  isSaving = false,
  lastSaved = null,
  onSave,
}) => {
  const {
    device,
    setDevice,
    zoom,
    setZoom,
    showGrid,
    toggleGrid,
    selectedIds,
    pageState,
    selectComponent,
    leftPanel,
    setLeftPanel,
    rightPanel,
    setRightPanel,
    undo,
    redo,
    hasConflict,
    isPageEmpty,
  } = useEditorStore();

  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const pageId = searchParams.get('pageId');

  const [showHelpMenu, setShowHelpMenu] = React.useState(false);

  const { canUndo, canRedo, isDirty } = useHistoryStore();

  const handleReload = () => {
    // In a real app, this would fetch the latest page from the server
    console.log('Would reload page from server');
  };

  // Add Cmd+S / Ctrl+S shortcut for saving
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Conflict Modal */}
      {hasConflict && <ConflictModal onReload={handleReload} />}

      {/* Top Bar */}
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900 z-50">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg tracking-tight text-brand-blue">Canvasly</div>
          <div className="h-4 w-px bg-zinc-800" />
          <PageSelector siteId={siteId} currentPageId={pageId} />

          <div className="h-4 w-px bg-zinc-800" />
          <LocaleSwitcher />

          {isSaving && (
            <span className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium ml-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              Saving...
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium ml-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Saved {formatTimeAgo(lastSaved)}
            </span>
          )}
          {isDirty && !isSaving && !lastSaved && (
            <span className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium ml-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Unsaved
            </span>
          )}
        </div>

        {/* Undo/Redo + Viewport Controls */}
        <div className="flex items-center gap-6">
          {/* Undo/Redo */}
          <div className="flex items-center bg-zinc-950/50 rounded-lg p-0.5 gap-0.5 border border-zinc-800/50">
            <button
              onClick={undo}
              aria-disabled={!canUndo()}
              aria-label="Undo"
              data-testid="toolbar-undo-button"
              className={`p-1.5 rounded-md transition-all ${
                canUndo()
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  : 'text-zinc-700 cursor-not-allowed opacity-50'
              }`}
              title="Undo (Cmd+Z)"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={redo}
              aria-disabled={!canRedo()}
              aria-label="Redo"
              data-testid="toolbar-redo-button"
              className={`p-1.5 rounded-md transition-all ${
                canRedo()
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  : 'text-zinc-700 cursor-not-allowed opacity-50'
              }`}
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* Viewport Controls */}
          <div className="flex items-center bg-zinc-950/50 rounded-lg p-0.5 gap-0.5 border border-zinc-800/50">
            <button
              onClick={() => setDevice('desktop')}
              aria-label="Desktop View"
              aria-pressed={device === 'desktop'}
              data-testid="toolbar-device-desktop"
              className={`p-1.5 rounded-md transition-all ${device === 'desktop' ? 'bg-zinc-800 text-brand-blue shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              aria-label="Tablet View"
              aria-pressed={device === 'tablet'}
              data-testid="toolbar-device-tablet"
              className={`p-1.5 rounded-md transition-all ${device === 'tablet' ? 'bg-zinc-800 text-brand-blue shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              aria-label="Mobile View"
              aria-pressed={device === 'mobile'}
              data-testid="toolbar-device-mobile"
              className={`p-1.5 rounded-md transition-all ${device === 'mobile' ? 'bg-zinc-800 text-brand-blue shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        {/* Zoom & Actions */}
        <div className="flex items-center gap-3">
          <ThemeQuickAccess />
          <button
            onClick={() => toggleGrid()}
            aria-label="Toggle Grid"
            aria-pressed={showGrid}
            data-testid="toolbar-toggle-grid"
            className={`p-1.5 rounded-md transition-all ${showGrid ? 'bg-zinc-800 text-brand-blue' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            title="Toggle Grid"
          >
            <Grid size={16} />
          </button>
          <div className="flex items-center gap-2 bg-zinc-950/50 rounded-lg px-2 py-1 border border-zinc-800/50">
            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
              aria-label="Zoom Out"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ZoomOut size={14} />
            </button>
            <span
              className="text-[11px] font-medium w-9 text-center text-zinc-400"
              aria-label={`Current Zoom: ${Math.round(zoom * 100)}%`}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              aria-label="Zoom In"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          <button
            onClick={onSave}
            aria-disabled={isSaving}
            aria-label="Save"
            data-testid="toolbar-save-button"
            className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm ${
              isSaving
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
            title="Save Now (Cmd+S)"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowHelpMenu(!showHelpMenu)}
              aria-label="Help Menu"
              aria-expanded={showHelpMenu}
              className={`p-1.5 rounded-md transition-all ${showHelpMenu ? 'bg-zinc-800 text-brand-blue' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
              title="Help & Resources"
            >
              <HelpCircle size={16} />
            </button>

            {showHelpMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowHelpMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/20">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Editor Guide
                  </a>
                  <button
                    onClick={() => {
                      setShowHelpMenu(false);
                      // In a real app, this would open a shortcuts modal
                      alert(
                        'Keyboard Shortcuts:\n\nCmd+S: Save\nCmd+Z: Undo\nCmd+Shift+Z: Redo\nDelete: Delete Component\nCmd+C: Copy\nCmd+V: Paste',
                      );
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left"
                  >
                    <Keyboard size={14} />
                    Keyboard Shortcuts
                  </button>
                  <div className="h-px bg-zinc-800 my-1.5 mx-2" />
                  <a
                    href="mailto:support@canvasly.dev"
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    <Mail size={14} />
                    Contact Support
                  </a>
                </div>
              </>
            )}
          </div>

          <PublishButton />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
          {/* Panel Switcher */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/20">
            <button
              onClick={() => setLeftPanel('palette')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all relative ${
                leftPanel === 'palette' ? 'text-brand-blue' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid size={14} />
              Components
              {leftPanel === 'palette' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setLeftPanel('layers')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all relative ${
                leftPanel === 'layers' ? 'text-brand-blue' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Layers size={14} />
              Layers
              {leftPanel === 'layers' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setLeftPanel('ai')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all relative ${
                leftPanel === 'ai' ? 'text-brand-blue' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span
                className={`relative ${leftPanel !== 'ai' && isPageEmpty() ? 'animate-pulse' : ''}`}
              >
                <Sparkles size={14} />
                {leftPanel !== 'ai' && isPageEmpty() && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-blue rounded-full animate-ping" />
                )}
              </span>
              AI
              {leftPanel === 'ai' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
              {leftPanel !== 'ai' && isPageEmpty() && (
                <div className="absolute inset-0 bg-brand-blue/5 rounded-none animate-pulse" />
              )}
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {leftPanel === 'palette' && <ComponentPalette />}
            {leftPanel === 'layers' && <LayerPanel />}
            {leftPanel === 'ai' && <AIPagePanel />}
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 relative bg-zinc-950 overflow-hidden flex flex-col">
          <div className="flex-1">{children}</div>

          {/* Breadcrumb Navigation */}
          {selectedIds.length > 0 && pageState && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
              <BreadcrumbNav
                selectedId={selectedIds[0]}
                pageState={pageState}
                onSelectComponent={(id) => selectComponent(id)}
              />
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-72 border-l border-zinc-800 bg-zinc-900 flex flex-col">
          {/* Panel Switcher */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/20">
            <button
              onClick={() => setRightPanel('properties')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all relative ${
                rightPanel === 'properties'
                  ? 'text-brand-blue'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings size={14} />
              Properties
              {rightPanel === 'properties' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setRightPanel('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all relative ${
                rightPanel === 'history' ? 'text-brand-blue' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <History size={14} />
              History
              {rightPanel === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {rightPanel === 'properties' ? (
              <PropertyPanel />
            ) : (
              <HistoryPanel onUndo={undo} onRedo={redo} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
