import React from 'react';
import { Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useAIGenerationStore } from '../../store/aiGenerationStore';
import { AIPromptForm } from './AIPromptForm';
import { AIGenerationProgress } from './AIGenerationProgress';
import { generatePage, generateIdempotencyKey } from '../../lib/aiPageApi';
import type {
  GeneratedSectionData,
  PageCompleteData,
  PageGenerationEvent,
  SectionPlan,
  SectionFailedData,
} from '../../lib/aiPageApi';
import type { TemplateWithContent } from '../../types/templates';
import type { Component } from '@canvasly/dsl-schema';

export const AIPagePanel: React.FC = () => {
  const { siteId, pageId, addSectionTemplate, defaultLocale } = useEditorStore();
  const aiStore = useAIGenerationStore();

  const handleStartGeneration = async (prompt: string, style: string) => {
    if (!siteId || !pageId) return;

    const idempotencyKey = generateIdempotencyKey();
    const abortController = new AbortController();

    aiStore.startGeneration(idempotencyKey, abortController);

    try {
      const generator = generatePage(
        {
          site_id: siteId,
          page_id: pageId,
          prompt,
          locale: defaultLocale || 'en',
          style_preference: style,
        },
        idempotencyKey,
        abortController.signal,
      );

      for await (const event of generator) {
        handleGenerationEvent(event);
      }

      // If loop finishes without error/complete, mark as complete
      if (aiStore.status === 'generating') {
        aiStore.complete();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[AI] Generation cancelled by user');
      } else {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred during generation.';
        aiStore.setError(errorMessage);
      }
    }
  };

  const handleGenerationEvent = (event: PageGenerationEvent) => {
    aiStore.setLastEventId(event.seq.toString());

    switch (event.event) {
      case 'section_planned':
        aiStore.setPlan(event.data as SectionPlan);
        break;

      case 'section_generated': {
        const data = event.data as GeneratedSectionData;
        aiStore.markSectionStarted(data.section_type);

        // Fetch latest state from store to ensure correct offset if events arrive quickly
        const currentCount = useEditorStore.getState().pageState?.componentOrder.length ?? 0;
        addSectionTemplate(
          {
            id: `ai-sec-${data.section_type}-${data.index}`,
            name: data.section_name,
            type: 'section',
            category: 'landing', // Default category
            content: data.content as unknown as {
              components: Record<string, Component>;
              rootComponentId: string;
            },
            tags: ['ai-generated'],
            is_system: false,
            version: '1.0',
            slug: `ai-section-${data.index}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as TemplateWithContent,
          { type: 'inside', targetId: null, index: currentCount + data.index },
        );

        aiStore.markSectionComplete();
        break;
      }

      case 'section_failed':
        aiStore.markSectionFailed(event.data as SectionFailedData);
        break;

      case 'page_complete': {
        const data = event.data as PageCompleteData;

        // Fetch the freshest state from the store instead of using the stale closure
        // which wipes out all the newly generated sections (Issue fix)
        const currentStoreState = useEditorStore.getState().pageState;
        const setFreshPageState = useEditorStore.getState().setPageState;

        // Finalize SEO and Theme if provided
        if (currentStoreState && currentStoreState.page && (data.seo || data.theme)) {
          const newState = { ...currentStoreState };
          const page = { ...newState.page };

          if (data.seo) {
            page.seo = { ...page.seo, ...data.seo };
          }

          newState.page = page;

          if (data.theme) {
            console.log('[AI] Page Theme Generated:', data.theme);
          }
          setFreshPageState(newState, true);
        }

        aiStore.complete();
        break;
      }

      case 'error':
        aiStore.setError((event.data as { message?: string })?.message || 'Generation failed');
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-900 overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {aiStore.status === 'idle' && (
          <AIPromptForm onSubmit={handleStartGeneration} isGenerating={false} />
        )}

        {(aiStore.status === 'generating' || aiStore.status === 'complete') && (
          <AIGenerationProgress
            plan={aiStore.plan}
            completedSections={aiStore.completedSections}
            totalSections={aiStore.totalSections}
            currentSectionType={aiStore.currentSectionType}
            failedSections={aiStore.failedSections}
            onCancel={aiStore.cancel}
            isComplete={aiStore.status === 'complete'}
          />
        )}

        {aiStore.status === 'complete' && (
          <div className="px-5 pb-6 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 relative">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full translate-y-4" />

            <div className="relative p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-4 text-center overflow-hidden">
              {/* Subtle top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0" />

              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-zinc-100">Generation Complete</h4>
                <p className="text-[12px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
                  Your page has been beautifully built and assembled.
                </p>
              </div>
              <button
                onClick={aiStore.reset}
                className="mt-1 w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/50 text-[12px] font-medium text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all active:scale-[0.98]"
              >
                Start New Generation
              </button>
            </div>
          </div>
        )}

        {(aiStore.status === 'error' || aiStore.status === 'cancelled') && (
          <div className="px-5 py-8 flex flex-col items-center text-center gap-5">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border ${
                aiStore.status === 'error'
                  ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {aiStore.status === 'error' ? (
                <AlertCircle size={28} className="text-red-400" />
              ) : (
                <Sparkles size={28} className="text-zinc-500" />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <h4 className="text-[15px] font-bold text-zinc-200 tracking-tight">
                {aiStore.status === 'error' ? 'Generation Interrupted' : 'Process Cancelled'}
              </h4>
              <p className="text-[12px] text-zinc-500 max-w-[240px] mx-auto leading-relaxed">
                {aiStore.error || 'The generation was stopped securely.'}
              </p>
            </div>

            <button
              onClick={aiStore.reset}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 rounded-xl text-[12px] font-medium text-zinc-300 transition-all active:scale-[0.98] mt-2"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Persistence / Info Footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950">
        <div className="flex items-center justify-between text-[10px] text-zinc-700">
          <span>{aiStore.idempotencyKey ? 'Session Active' : 'Waiting for prompt'}</span>
          {aiStore.lastEventId && <span>Event ID: {aiStore.lastEventId}</span>}
        </div>
      </div>
    </div>
  );
};
