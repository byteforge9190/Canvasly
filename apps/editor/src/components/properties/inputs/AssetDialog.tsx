import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Check, Loader2, Trash2 } from 'lucide-react';
import { assetsApi } from '../../../lib/api';
import type { Asset } from '../../../types/asset';

interface AssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  siteId: string;
  allowedTypes?: string[]; // e.g. ['image/jpeg', 'image/png']
}

export function AssetDialog({
  isOpen,
  onClose,
  onSelect,
  siteId,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}: AssetDialogProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadAssets = useCallback(
    async (pageNum: number) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const limit = 20;
        const data = await assetsApi.list(siteId, pageNum, limit);

        if (!data || data.length < limit) {
          setHasMore(false);
        }

        if (pageNum === 1) {
          setAssets(data || []);
        } else {
          setAssets((prev) => [...prev, ...(data || [])]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assets');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [siteId],
  );

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setAssets([]);
      setHasMore(true);
      loadAssets(1);
    }
  }, [isOpen, loadAssets]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadAssets(nextPage);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError(
        `File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`,
      );
      return;
    }

    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Perform unified API-based upload
      const newAsset = await assetsApi.upload(siteId, file);

      // Add to list and select
      setAssets((prev) => [newAsset, ...prev]);
      setSelectedAssetId(newAsset.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload asset');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await assetsApi.delete(siteId, assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      if (selectedAssetId === assetId) {
        setSelectedAssetId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
    }
  };

  const handleSelect = () => {
    const asset = assets.find((a) => a.id === selectedAssetId);
    if (asset) {
      onSelect(asset);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col text-zinc-200 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-zinc-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-blue/10 border border-brand-blue/20">
              <ImageIcon className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight">Select Asset</h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                Choose or upload an image for your site
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-zinc-900/50">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-[13px] font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Upload Button */}
            <label className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue/50 hover:bg-brand-blue/5 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              {uploading ? (
                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
              ) : (
                <>
                  <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-brand-blue/10 group-hover:scale-110 transition-all mb-3 border border-zinc-700/50">
                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-brand-blue" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-brand-blue">
                    Upload New
                  </span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept={allowedTypes.join(',')}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>

            {/* Asset List */}
            {loading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-800/50 rounded-xl animate-pulse border border-zinc-800/50"
                />
              ))
            ) : (
              <>
                {(assets || []).map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`group relative aspect-square rounded-xl border-2 cursor-pointer overflow-hidden transition-all shadow-sm ${
                      selectedAssetId === asset.id
                        ? 'border-brand-blue ring-4 ring-brand-blue/10 bg-brand-blue/5'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    {asset.mime_type.startsWith('image/') && asset.url ? (
                      <img
                        src={asset.url}
                        alt={asset.filename}
                        className={`w-full h-full object-cover transition-transform duration-500 ${selectedAssetId === asset.id ? 'scale-105' : 'group-hover:scale-110'}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                        <ImageIcon className="w-8 h-8 text-zinc-700" />
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {selectedAssetId === asset.id && (
                      <div className="absolute top-2 right-2 bg-brand-blue text-white p-1 rounded-full z-10 shadow-lg border border-white/20">
                        <Check className="w-3 h-3 stroke-3" />
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(e, asset.id)}
                      className="absolute top-2 left-2 bg-red-500/90 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-10 shadow-lg backdrop-blur-sm"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-medium text-zinc-200 truncate">
                        {asset.filename}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Load More Button */}
          {!loading && hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[13px] font-semibold transition-all border border-zinc-700/50 disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading assets...
                  </span>
                ) : (
                  'Load More Assets'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-zinc-800/50 bg-zinc-950/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-[13px] font-semibold transition-all border border-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedAssetId}
            className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-brand-blue/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Select Asset
          </button>
        </div>
      </div>
    </div>
  );
}
