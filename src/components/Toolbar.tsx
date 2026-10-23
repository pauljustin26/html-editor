import { useState } from 'react';
import {
  FileCode2, Minimize2, Maximize2, Sparkles, ClipboardCopy,
  Trash2, MessageSquarePlus, Palette, Moon, Sun, Contrast,
} from 'lucide-react';
import { countBytes, countChars } from '../utils/htmlFormatter';
import { THEME_OPTIONS, type EditorViewMode, type AppThemeId } from '../types';

interface ToolbarProps {
  pcHtml: string;
  spHtml: string;
  activeMode: EditorViewMode;
  theme: AppThemeId;
  onThemeChange: (theme: AppThemeId) => void;
  onBeautify: () => void;
  onMinify: () => void;
  onCleanWord: () => void;
  onCopyHTML: () => void;
  onClear: () => void;
  onOpenFeedback: () => void;
}

export function Toolbar({
  pcHtml, spHtml, activeMode, theme, onThemeChange,
  onBeautify, onMinify, onCleanWord, onCopyHTML, onClear, onOpenFeedback,
}: ToolbarProps) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const activeHtml = activeMode === 'pc' ? pcHtml : spHtml;
  const charCount = countChars(activeHtml);
  const activeBytes = countBytes(activeHtml);

  // E-commerce platform limits: PC typically 128KB, SP typically 30KB
  const BYTE_LIMIT = activeMode === 'pc' ? 128000 : 30000;
  const byteWarning = activeBytes > BYTE_LIMIT * 0.9;
  const byteError = activeBytes > BYTE_LIMIT;

  const pcBytes = countBytes(pcHtml);
  const spBytes = countBytes(spHtml);

  const currentTheme = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  const getThemeIcon = (themeId: AppThemeId) => {
    switch (themeId) {
      case 'vs-light':
        return <Sun size={13} className="text-[#cca700]" />;
      case 'monokai':
        return <Palette size={13} className="text-[#a6e22e]" />;
      case 'hc-black':
        return <Contrast size={13} className="text-[#6fc1ff]" />;
      case 'vs-dark':
      default:
        return <Moon size={13} className="text-[#569cd6]" />;
    }
  };

  return (
    <div className="flex items-center h-9 bg-[#252526] border-b border-[#333333] px-2 gap-1 shrink-0 select-none">
      <div className="flex items-center gap-1.5 mr-3">
        <FileCode2 size={16} className="text-[#007acc]" />
        <span className="text-xs font-semibold text-[#cccccc] tracking-wide">HTML EDITOR</span>
      </div>

      <div className="h-4 w-px bg-[#333333] mx-1" />

      <ToolButton icon={<Maximize2 size={14} />} label="Beautify" onClick={onBeautify} />
      <ToolButton icon={<Minimize2 size={14} />} label="Minify" onClick={onMinify} />
      <ToolButton icon={<Sparkles size={14} />} label="Clean Word" onClick={onCleanWord} />

      <div className="h-4 w-px bg-[#333333] mx-1" />

      <ToolButton icon={<ClipboardCopy size={14} />} label="Copy Active" onClick={onCopyHTML} />
      <ToolButton icon={<Trash2 size={14} />} label="Clear Active" onClick={onClear} />

      <div className="h-4 w-px bg-[#333333] mx-1" />

      <ToolButton
        icon={<MessageSquarePlus size={14} className="text-[#007acc]" />}
        label="Feedback"
        onClick={onOpenFeedback}
        shortcut="Ctrl+Shift+F"
      />

      {/* Theme Selector */}
      <div className="relative">
        <button
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          title={`Theme: ${currentTheme.label}`}
          className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] text-[#cccccc] rounded-[3px]
            hover:bg-[#2a2d2e] active:bg-[#37373d] transition-colors cursor-pointer
            focus:outline-none focus:ring-1 focus:ring-[#007acc]"
        >
          {getThemeIcon(theme)}
          <span className="hidden sm:inline font-medium">{currentTheme.label}</span>
        </button>

        {showThemeMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
            <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#474747] rounded shadow-2xl z-50 min-w-[190px] py-1 overflow-hidden">
              <div className="px-3 py-1 text-[10px] uppercase font-mono text-[#6b6b6b] border-b border-[#333333]">
                Color Themes
              </div>
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#2a2d2e] cursor-pointer transition-colors ${
                    theme === t.id ? 'text-[#007acc] font-semibold bg-[#2a2d2e]/50' : 'text-[#cccccc]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {getThemeIcon(t.id)}
                    <span>{t.label}</span>
                  </span>
                  <span className="text-[10px] text-[#6b6b6b] font-mono px-1 py-0.2 rounded border border-[#333333]">
                    {t.badge}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="h-4 w-px bg-[#333333] mx-1" />

      {/* GitHub Repository Link */}
      <a
        href="https://github.com/pauljustin26/html-editor"
        target="_blank"
        rel="noopener noreferrer"
        title="View GitHub Repository"
        className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-[#cccccc] rounded-[3px]
          hover:bg-[#2a2d2e] active:bg-[#37373d] transition-colors cursor-pointer
          focus:outline-none focus:ring-1 focus:ring-[#007acc]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        <span className="hidden sm:inline">GitHub</span>
      </a>

      <div className="flex-1" />

      {/* Stats counters */}
      <div className="flex items-center gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-[#999999]">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${activeMode === 'pc' ? 'bg-[#007acc] text-white' : 'bg-[#333333] text-[#999999]'}`}>
            PC
          </span>
          <span className="text-[#cccccc]">{pcBytes.toLocaleString()} B</span>
        </div>

        <div className="h-3 w-px bg-[#333333]" />

        <div className="flex items-center gap-1.5 text-[#999999]">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${activeMode === 'sp' ? 'bg-[#007acc] text-white' : 'bg-[#333333] text-[#999999]'}`}>
            SP
          </span>
          <span className="text-[#cccccc]">{spBytes.toLocaleString()} B</span>
        </div>

        <div className="h-3 w-px bg-[#333333]" />

        <span className="text-[#999999] hidden lg:inline">
          Active Chars: <span className="text-[#cccccc]">{charCount.toLocaleString()}</span>
        </span>

        <span className={byteError ? 'text-[#f44747]' : byteWarning ? 'text-[#cca700]' : 'text-[#999999]'}>
          Active: <span className={byteError ? 'text-[#f44747] font-bold' : byteWarning ? 'text-[#cca700]' : 'text-[#cccccc]'}>
            {activeBytes.toLocaleString()}
          </span>
          {byteWarning && !byteError && ' ⚠'}
          {byteError && ' ✗ OVER'}
          <span className="text-[#6b6b6b]"> / {(BYTE_LIMIT / 1000).toFixed(0)}KB</span>
        </span>
      </div>
    </div>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
  shortcut,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-[#cccccc] rounded-[3px]
        hover:bg-[#2a2d2e] active:bg-[#37373d] transition-colors cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-[#007acc]"
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
      {shortcut && (
        <span className="hidden xl:inline text-[9px] text-[#6b6b6b] bg-[#1e1e1e] px-1 py-0.2 rounded border border-[#333333]">
          {shortcut}
        </span>
      )}
    </button>
  );
}
