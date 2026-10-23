import { useState } from 'react';
import { THEME_OPTIONS, type AppThemeId } from '../types';

interface StatusBarProps {
  line: number;
  column: number;
  encoding: string;
  diagnosticCount: number;
  platform: string;
  onPlatformChange: (platform: string) => void;
  theme: AppThemeId;
  onThemeChange: (theme: AppThemeId) => void;
}

const PLATFORMS = [
  { id: 'rakuten', label: 'Rakuten', limit: 128000 },
  { id: 'yahoo', label: 'Yahoo Shopping', limit: 100000 },
  { id: 'custom', label: 'Custom', limit: 0 },
];

export function StatusBar({
  line, column, encoding, diagnosticCount, platform, onPlatformChange, theme, onThemeChange,
}: StatusBarProps) {
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const currentPlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];
  const currentTheme = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  return (
    <div className="flex items-center h-[22px] bg-[#007acc] px-2 text-[11px] text-white shrink-0 select-none">
      <div className="flex items-center gap-3">
        {diagnosticCount > 0 ? (
          <span className="flex items-center gap-1 font-mono">
            ⚠ {diagnosticCount} issue{diagnosticCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <span>✓ No issues</span>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3 font-mono">
        <span>Ln {line}, Col {column}</span>
        <span>{encoding}</span>

        {/* Theme indicator */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="hover:bg-white/20 px-1.5 py-0 rounded cursor-pointer font-sans
              focus:outline-none focus:ring-1 focus:ring-white/50"
            title="Switch Color Theme"
          >
            {currentTheme.label}
          </button>
          {showThemeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
              <div className="absolute bottom-full right-0 mb-1 bg-[#252526] border border-[#474747] rounded shadow-2xl z-50 min-w-[160px] py-1 font-sans">
                {THEME_OPTIONS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#2a2d2e] cursor-pointer transition-colors ${
                      theme === t.id ? 'text-[#007acc] font-bold bg-[#2a2d2e]/50' : 'text-[#cccccc]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Platform selector */}
        <div className="relative">
          <button
            onClick={() => setShowPlatformMenu(!showPlatformMenu)}
            className="hover:bg-white/20 px-1.5 py-0 rounded cursor-pointer font-sans
              focus:outline-none focus:ring-1 focus:ring-white/50"
          >
            {currentPlatform.label}
          </button>
          {showPlatformMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPlatformMenu(false)} />
              <div className="absolute bottom-full right-0 mb-1 bg-[#252526] border border-[#474747] rounded shadow-2xl z-50 min-w-[140px] py-1 font-sans">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onPlatformChange(p.id);
                      setShowPlatformMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#2a2d2e] cursor-pointer transition-colors ${
                      platform === p.id ? 'text-[#007acc] font-bold' : 'text-[#cccccc]'
                    }`}
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
