import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FrameOverlay, AnimationPreset, Placement } from '@canvasly/dsl-schema';

interface OverlayWrapperProps {
  overlayId: string;
  overlay: FrameOverlay;
  triggerId?: string;
  placement?: Placement;
  offset?: number;
  zIndex: number;
  onClose: () => void;
  children: React.ReactNode;
}

const animationClasses: Record<AnimationPreset, string> = {
  none: '',
  fade: 'bn-overlay-fade',
  scale: 'bn-overlay-scale',
  'slide-up': 'bn-overlay-slide-up',
  'slide-down': 'bn-overlay-slide-down',
  'slide-left': 'bn-overlay-slide-left',
  'slide-right': 'bn-overlay-slide-right',
};

export function OverlayWrapper({
  overlayId,
  overlay,
  triggerId,
  placement = 'bottom',
  offset = 8,
  zIndex,
  onClose,
  children,
}: OverlayWrapperProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = React.useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const closeTimeoutRef = useRef<number | null>(null);

  // Calculate position after mount
  useLayoutEffect(() => {
    if (!triggerId || !overlayRef.current) return;

    const trigger = document.getElementById(triggerId);
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - overlayRect.height - offset;
        left = triggerRect.left + triggerRect.width / 2 - overlayRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + triggerRect.width / 2 - overlayRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - overlayRect.height / 2;
        left = triggerRect.left - overlayRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - overlayRect.height / 2;
        left = triggerRect.right + offset;
        break;
      default:
        top = triggerRect.bottom + offset;
        left = triggerRect.left;
    }

    setPosition({ top, left });
  }, [triggerId, placement, offset]);

  // Handle hover for keeping overlay open
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // Delay closing to allow moving between trigger and overlay
    closeTimeoutRef.current = window.setTimeout(() => {
      handleClose();
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Handle click outside
  useEffect(() => {
    if (!overlay.dismissOnClickOutside) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [overlay.dismissOnClickOutside]);

  // Handle escape key
  useEffect(() => {
    if (!overlay.dismissOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [overlay.dismissOnEscape]);

  // Focus trap
  useEffect(() => {
    if (!overlay.trapFocus) return;

    const focusableElements = overlayRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [overlay.trapFocus]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, overlay.animationDuration);
  };

  const enterAnimation = animationClasses[overlay.animationEnter];
  const exitAnimation = animationClasses[overlay.animationExit];
  const animationClass = isExiting ? exitAnimation : enterAnimation;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    zIndex,
    animationDuration: `${overlay.animationDuration}ms`,
  };

  const backdropStyle: React.CSSProperties = overlay.backdropEnabled
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: overlay.backdropColor,
        backdropFilter: overlay.backdropBlur ? `blur(${overlay.backdropBlur}px)` : undefined,
        zIndex: zIndex - 1,
      }
    : {};

  return createPortal(
    <>
      {overlay.backdropEnabled && <div className="bn-overlay-backdrop" style={backdropStyle} />}
      <div
        ref={overlayRef}
        id={overlayId}
        className={`bn-overlay ${animationClass}`}
        style={overlayStyle}
        role={overlay.modal ? 'dialog' : 'tooltip'}
        aria-modal={overlay.modal}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
