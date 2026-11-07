import React, { useState, useEffect, useRef } from 'react';
import '../../styles/interactive/assistant-chat.css';
import * as LucideIcons from 'lucide-react';

interface ChatWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  siteId: string;
  accentColor?: string;
  assistantBubbleColor?: string;
  userBubbleColor?: string;
  fontFamily?: string;
  inputPlaceholder?: string;
  headerTitle?: string;
  toggleIcon?: string;
  toggleIconSize?: number;
  toggleButtonColor?: string;
  toggleIconColor?: string;
  'data-component-id'?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function ChatWidget({
  siteId,
  accentColor = '#3b82f6',
  assistantBubbleColor = '#f3f4f6',
  userBubbleColor = '#3b82f6',
  fontFamily,
  inputPlaceholder = 'Type a message...',
  headerTitle = 'Chat Assistant',
  toggleIcon = 'MessageCircle',
  toggleIconSize = 28,
  toggleButtonColor,
  toggleIconColor = '#ffffff',
  className,
  style,
  ...props
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return window.frameElement ? true : window.location.pathname.includes('/preview');
      } catch {
        return false;
      }
    }
    return false;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [visitorId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem('canvasly-visitor-id');
    if (stored) return stored;
    const newId = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('canvasly-visitor-id', newId);
    return newId;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!siteId) {
      setMessages([
        {
          id: 'placeholder',
          role: 'assistant',
          content: 'Chat assistant will be available on the published site.',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [siteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading || !isClient) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'This is a demo response. Chat is available in production.',
          timestamp: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  if (isClient && !siteId) return null;

  const toKebabCase = (str: string) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const iconName = toKebabCase(toggleIcon || 'MessageCircle');

  const LucideIcon =
    (LucideIcons[toggleIcon as keyof typeof LucideIcons] as React.ElementType) ||
    LucideIcons.MessageCircle;
  const CloseIcon = LucideIcons.X as React.ElementType;

  return (
    <div
      className={`canvasly-assistant-widget ${isOpen ? 'canvasly-assistant-expanded' : ''} ${className || ''}`}
      style={
        {
          ...style,
          '--accent-color': accentColor,
          '--assistant-bubble-color': assistantBubbleColor,
          '--user-bubble-color': userBubbleColor,
          '--toggle-button-color': toggleButtonColor || accentColor,
          '--toggle-icon-color': toggleIconColor,
          fontFamily: fontFamily || 'inherit',
        } as React.CSSProperties
      }
      data-site-id={siteId}
      data-toggle-icon={iconName}
      data-toggle-icon-size={toggleIconSize}
      data-toggle-icon-color={toggleIconColor}
      data-toggle-button-color={toggleButtonColor || accentColor}
      data-header-title={headerTitle}
      {...props}
    >
      <button
        className="canvasly-assistant-toggle-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat assistant"
      >
        <LucideIcon size={toggleIconSize} color={toggleIconColor} />
      </button>

      <div className="canvasly-assistant-container">
        <div className="canvasly-assistant-header">
          <h3>{headerTitle}</h3>
          <button
            className="canvasly-assistant-close-button"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat assistant"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <>
          <div className="canvasly-assistant-messages">
            {messages.map((m) => (
              <div key={m.id} className={`canvasly-assistant-message canvasly-assistant-message-${m.role}`}>
                <div className="canvasly-assistant-message-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="canvasly-assistant-message canvasly-assistant-message-assistant">
                <div className="canvasly-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="canvasly-assistant-input-form" onSubmit={handleSubmit}>
            <input
              className="canvasly-assistant-input"
              placeholder={inputPlaceholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button
              className="canvasly-assistant-send-button"
              type="submit"
              disabled={loading || !inputText.trim()}
            >
              Send
            </button>
          </form>
          <div className="canvasly-assistant-disclaimer">AI-generated content.</div>
        </>
      </div>
    </div>
  );
}
