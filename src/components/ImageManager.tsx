import { useState } from 'react';
import { Image, Replace, Search } from 'lucide-react';
import type { ImageInfo } from '../utils/imageExtractor';

interface ImageManagerProps {
  images: ImageInfo[];
  onImageClick: (image: ImageInfo) => void;
  onReplaceUrls: (search: string, replace: string, useRegex: boolean) => void;
}

export function ImageManager({ images, onImageClick, onReplaceUrls }: ImageManagerProps) {
  const [showReplace, setShowReplace] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [replaceVal, setReplaceVal] = useState('');
  const [useRegex, setUseRegex] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333333] shrink-0">
        <span className="text-[11px] text-[#999999] flex items-center gap-1.5">
          <Image size={12} />
          Images ({images.length})
        </span>
        <button
          onClick={() => setShowReplace(!showReplace)}
          title="Quick Replace URLs"
          className="text-[#999999] hover:text-[#cccccc] cursor-pointer p-0.5 rounded
            focus:outline-none focus:ring-1 focus:ring-[#007acc]"
        >
          <Replace size={13} />
        </button>
      </div>

      {showReplace && (
        <div className="p-3 bg-[#252526] border-b border-[#333333] space-y-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6b6b6b]" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search pattern..."
              className="w-full bg-[#3c3c3c] text-[#cccccc] text-[12px] pl-7 pr-2 py-1 rounded border border-[#474747]
                focus:outline-none focus:border-[#007acc] placeholder:text-[#6b6b6b]"
            />
          </div>
          <input
            type="text"
            value={replaceVal}
            onChange={e => setReplaceVal(e.target.value)}
            placeholder="Replace with..."
            className="w-full bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1 rounded border border-[#474747]
              focus:outline-none focus:border-[#007acc] placeholder:text-[#6b6b6b]"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] text-[#999999] cursor-pointer">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={e => setUseRegex(e.target.checked)}
                className="rounded accent-[#007acc]"
              />
              Regex
            </label>
            <button
              onClick={() => {
                if (searchVal) {
                  onReplaceUrls(searchVal, replaceVal, useRegex);
                  setShowReplace(false);
                  setSearchVal('');
                  setReplaceVal('');
                }
              }}
              disabled={!searchVal}
              className="px-3 py-1 text-[11px] bg-[#007acc] text-white rounded hover:bg-[#1a8ad4]
                disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                focus:outline-none focus:ring-1 focus:ring-[#007acc] focus:ring-offset-1 focus:ring-offset-[#252526]"
            >
              Replace All
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {images.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[12px] text-[#6b6b6b]">
            No images found
          </div>
        ) : (
          <div className="space-y-1.5">
            {images.map((img, i) => (
              <button
                key={`${img.src}-${img.line}-${i}`}
                onClick={() => onImageClick(img)}
                className="w-full text-left p-2 rounded hover:bg-[#2a2d2e] transition-colors cursor-pointer
                  border border-transparent hover:border-[#474747]
                  focus:outline-none focus:border-[#007acc]"
              >
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-[#2d2d2d] rounded border border-[#333333] shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={img.src}
                      alt={img.alt || 'thumbnail'}
                      className="max-w-full max-h-full object-contain"
                      onError={e => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        if (el.parentElement) {
                          el.parentElement.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
                        }
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[#cccccc] truncate break-all">{img.src || '(empty src)'}</p>
                    <p className="text-[10px] text-[#6b6b6b]">
                      Ln {img.line}
                      {img.width && ` • ${img.width}×${img.height || '?'}`}
                    </p>
                    {img.alt && (
                      <p className="text-[10px] text-[#569cd6] truncate">alt: {img.alt}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
