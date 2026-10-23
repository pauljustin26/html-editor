import { useState } from 'react';

interface StatusBarProps {
  line: number;
  column: number;
  encoding: string;
  diagnosticCount: number;
  platform: string;
  onPlatformChange: (platform: string) => void;
}

const PLATFORMS = [
  { id: 'rakuten', label: 'Rakuten', limit: 128000 },
  { id: 'yahoo', label: 'Yahoo Shopping', limit: 100000 },
  { id: 'custom', label: 'Custom', limit: 0 },
];

export function StatusBar({ line, column, encoding, diagnosticCount, platform, onPlatformChange }: StatusBarProps) {
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const currentPlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];

  return (
    <div className="flex items-center h-[22px] bg-[#007acc] px-2 text-[11px] text-white shrink-0 select-none">
      <div className="flex items-center gap-3">
        {diagnosticCount > 0 ? (
          <span className="flex items-center gap-1">
            ⚠ {diagnosticCount} issue{diagnosticCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <span>✓ No issues</span>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <span>Ln {line}, Col {column}</span>
        <span>{encoding}</span>

        <div className="relative">
          <button
            onClick={() => setShowPlatformMenu(!showPlatformMenu)}
            className="hover:bg-white/20 px-1.5 py-0 rounded cursor-pointer
              focus:outline-none focus:ring-1 focus:ring-white/50"
          >
            {currentPlatform.label}
          </button>
          {showPlatformMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPlatformMenu(false)} />
              <div className="absolute bottom-full right-0 mb-1 bg-[#252526] border border-[#474747] rounded shadow-lg z-50 min-w-[140px]">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onPlatformChange(p.id);
                      setShowPlatformMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#2a2d2e] cursor-pointer
                      focus:outline-none focus:bg-[#2a2d2e] transition-colors
                      ${platform === p.id ? 'text-[#007acc]' : 'text-[#cccccc]'}`}
                  >
                    {p.label}
                    {p.limit > 0 && <span className="text-[#6b6b6b] ml-1">({(p.limit / 1000).toFixed(0)}KB)</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
