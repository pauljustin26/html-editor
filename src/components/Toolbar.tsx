import {
  FileCode2, Minimize2, Maximize2, Sparkles, ClipboardCopy,
  Trash2, MessageSquarePlus,
} from 'lucide-react';
import { countBytes, countChars } from '../utils/htmlFormatter';
import type { EditorViewMode } from '../types';

interface ToolbarProps {
  pcHtml: string;
  spHtml: string;
  activeMode: EditorViewMode;
  onBeautify: () => void;
  onMinify: () => void;
  onCleanWord: () => void;
  onCopyHTML: () => void;
  onClear: () => void;
  onOpenFeedback: () => void;
}

export function Toolbar({
  pcHtml, spHtml, activeMode, onBeautify, onMinify, onCleanWord, onCopyHTML, onClear, onOpenFeedback,
}: ToolbarProps) {
  const activeHtml = activeMode === 'pc' ? pcHtml : spHtml;
  const charCount = countChars(activeHtml);
  const activeBytes = countBytes(activeHtml);

  // E-commerce platform limits: PC typically 128KB, SP typically 30KB
  const BYTE_LIMIT = activeMode === 'pc' ? 128000 : 30000;
  const byteWarning = activeBytes > BYTE_LIMIT * 0.9;
  const byteError = activeBytes > BYTE_LIMIT;

  const pcBytes = countBytes(pcHtml);
  const spBytes = countBytes(spHtml);

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
        label="Feedback & Ideas"
        onClick={onOpenFeedback}
        shortcut="Ctrl+Shift+F"
      />

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

        <span className="text-[#999999]">
          Active Chars: <span className="text-[#cccccc]">{charCount.toLocaleString()}</span>
        </span>

        <span className={byteError ? 'text-[#f44747]' : byteWarning ? 'text-[#cca700]' : 'text-[#999999]'}>
          Active Bytes: <span className={byteError ? 'text-[#f44747] font-bold' : byteWarning ? 'text-[#cca700]' : 'text-[#cccccc]'}>
            {activeBytes.toLocaleString()}
          </span>
          {byteWarning && !byteError && ' ⚠'}
          {byteError && ' ✗ OVER LIMIT'}
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
