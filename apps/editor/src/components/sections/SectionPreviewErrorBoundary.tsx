import React from 'react';

interface SectionPreviewErrorBoundaryProps {
  children: React.ReactNode;
  thumbnailUrl?: string;
  name?: string;
}

interface SectionPreviewErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * SectionPreviewErrorBoundary - Catches render errors in section previews.
 * Falls back to thumbnail on failure.
 */
export class SectionPreviewErrorBoundary extends React.Component<
  SectionPreviewErrorBoundaryProps,
  SectionPreviewErrorBoundaryState
> {
  constructor(props: SectionPreviewErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SectionPreviewErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('Section preview render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { thumbnailUrl, name } = this.props;
      return (
        <div className="relative w-full h-64 bg-zinc-900 flex items-center justify-center overflow-hidden rounded-xl">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={name || 'Section preview'}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="text-zinc-600 text-sm font-medium">No preview available</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60">
            <span className="text-zinc-400 text-xs font-semibold px-3 py-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
              Live preview unavailable
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
