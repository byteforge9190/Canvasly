import React, { useState, useEffect } from 'react';
import { Save, X, Tag, AlertCircle } from 'lucide-react';

interface SaveComponentModalProps {
  isOpen: boolean;
  componentId: string;
  onClose: () => void;
  onSave: (name: string, description?: string, tags?: string[]) => Promise<void>;
}

export const SaveComponentModal: React.FC<SaveComponentModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    tags?: string;
  }>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setTagInput('');
      setTags([]);
      setError(null);
      setValidationErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const errors: { name?: string; tags?: string } = {};

    if (!name.trim()) {
      errors.name = 'Component name is required';
    } else if (name.length > 255) {
      errors.name = 'Name must be 255 characters or less';
    }

    if (tags.length > 10) {
      errors.tags = 'Maximum 10 tags allowed';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (trimmedTag.length > 50) {
        setValidationErrors({ ...validationErrors, tags: 'Tag must be 50 characters or less' });
        return;
      }
      if (tags.length >= 10) {
        setValidationErrors({ ...validationErrors, tags: 'Maximum 10 tags allowed' });
        return;
      }
      setTags([...tags, trimmedTag]);
      setTagInput('');
      setValidationErrors({ ...validationErrors, tags: undefined });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setValidationErrors({ ...validationErrors, tags: undefined });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(
        name.trim(),
        description.trim() || undefined,
        tags.length > 0 ? tags : undefined,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save component');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] max-w-lg w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-zinc-800 bg-linear-to-b from-brand-blue/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
                <Save size={20} className="text-brand-blue" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-100 tracking-tight">
                  Save to Component Library
                </h2>
                <p className="text-zinc-500 text-xs font-medium mt-0.5">
                  Reuse this component across your site
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20 animate-in fade-in duration-200">
              <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="component-name" className="block text-sm font-bold text-zinc-300">
              Component Name <span className="text-red-400">*</span>
            </label>
            <input
              id="component-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setValidationErrors({ ...validationErrors, name: undefined });
              }}
              placeholder="e.g., Custom Card, Hero Section"
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-zinc-950 border ${
                validationErrors.name ? 'border-red-500/50' : 'border-zinc-800'
              } rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              maxLength={255}
              autoFocus
            />
            {validationErrors.name && (
              <p className="text-red-400 text-xs font-medium">{validationErrors.name}</p>
            )}
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="component-description"
              className="block text-sm font-bold text-zinc-300"
            >
              Description <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <textarea
              id="component-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this component is used for..."
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={1000}
            />
            <p className="text-zinc-600 text-xs">{description.length}/1000 characters</p>
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <label htmlFor="component-tags" className="block text-sm font-bold text-zinc-300">
              Tags <span className="text-zinc-600 font-normal">(optional)</span>
            </label>

            {/* Tag Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-brand-blue text-xs font-bold"
                  >
                    <Tag size={12} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isLoading}
                      className="ml-1 hover:text-brand-blue/70 transition-colors disabled:opacity-50"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input Field */}
            <div className="flex gap-2">
              <input
                id="component-tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add a tag and press Enter"
                disabled={isLoading || tags.length >= 10}
                className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={50}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={isLoading || !tagInput.trim() || tags.length >= 10}
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700/50"
              >
                Add
              </button>
            </div>
            {validationErrors.tags && (
              <p className="text-red-400 text-xs font-medium">{validationErrors.tags}</p>
            )}
            <p className="text-zinc-600 text-xs">
              Press Enter to add tags. Maximum 10 tags, 50 characters each.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-all border border-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Component</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
