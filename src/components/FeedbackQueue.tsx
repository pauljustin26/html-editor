import { useState } from 'react';
import { Cloud } from 'lucide-react';
import { Trash2, Copy, Download, Check, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { FeedbackItem } from '../types';
import { compileFeedbackToMarkdown, downloadMarkdownFile } from '../utils/markdownCompiler';

interface FeedbackQueueProps {
  items: FeedbackItem[];
  onDeleteItem: (id: string) => void;
  onClearQueue: () => void;
  onSyncCloud: () => void;
  isSyncing: boolean;
}

export function FeedbackQueue({ items, onDeleteItem, onClearQueue, onSyncCloud, isSyncing }: FeedbackQueueProps) {
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Bug / Linter Error':
        return 'text-[#f44747] bg-[#f44747]/10 border-[#f44747]/30';
      case 'UI/UX Improvement':
        return 'text-[#4ec9b0] bg-[#4ec9b0]/10 border-[#4ec9b0]/30';
      case 'Feature Request':
        return 'text-[#569cd6] bg-[#569cd6]/10 border-[#569cd6]/30';
      default:
        return 'text-[#cccccc] bg-[#333333] border-[#474747]';
    }
  };

  const handleCopyMarkdown = async () => {
    const md = compileFeedbackToMarkdown(items);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const today = new Date().toISOString().slice(0, 10);
    const md = compileFeedbackToMarkdown(items);
    downloadMarkdownFile(`feedback-roadmap-${today}.md`, md);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center px-4">
        <FileText size={32} className="text-[#6b6b6b] mb-2" />
        <p className="text-sm text-[#cccccc] font-medium">Queue is Empty</p>
        <p className="text-xs text-[#999999] mt-1 max-w-sm">
          No feedback tickets logged yet. Submit a bug report or feature suggestion in the "New Feedback" tab.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between p-3 bg-[#252526] border-b border-[#333333] shrink-0">
        <div className="text-xs text-[#999999] font-mono">
          Total items: <span className="text-[#cccccc] font-bold">{items.length}</span>
        </div>
        <div className="flex items-center gap-2">
            {/* Sync from Cloud button */}
            <button
              onClick={onSyncCloud}
              disabled={isSyncing}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#3c7a3c] text-[#ffffff] hover:bg-[#2e6e2e] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Sync feedback items from cloud storage"
            >
              <Cloud size={13} className="text-[#ffffff]" />
              {isSyncing ? 'Syncing...' : 'Sync Cloud'}
            </button>
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4a4a4a] rounded border border-[#474747] transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007acc]"
            title="Compile and copy Markdown representation"
          >
            {copied ? <Check size={13} className="text-[#4ec9b0]" /> : <Copy size={13} />}
            <span>{copied ? 'Copied MD!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#007acc] text-white hover:bg-[#1a8ad4] rounded transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007acc]"
            title="Download .md bundle for AI sprint"
          >
            <Download size={13} />
            <span>Download .md</span>
          </button>

          <button
            onClick={onClearQueue}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[#f44747] hover:bg-[#f44747]/10 rounded border border-transparent hover:border-[#f44747]/30 transition-colors cursor-pointer"
            title="Clear all stored items"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Queue items list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#333333] p-2 space-y-2">
        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="bg-[#1e1e1e] border border-[#333333] rounded p-3 transition-colors hover:border-[#474747]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getCategoryBadgeClass(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#6b6b6b] font-mono">{item.createdAt}</span>
                    {item.context.diagnosticCount > 0 && (
                      <span className="text-[10px] text-[#f44747] flex items-center gap-0.5 font-mono">
                        <AlertCircle size={10} /> {item.context.diagnosticCount} errors
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-[#cccccc] break-words">
                    {item.title || '(No Title)'}
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1 text-[#999999] hover:text-[#cccccc] rounded hover:bg-[#2a2d2e] cursor-pointer"
                    title={isExpanded ? 'Collapse Context' : 'View Context'}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-[#999999] hover:text-[#f44747] rounded hover:bg-[#2a2d2e] cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Description preview / full */}
              <p className="text-xs text-[#999999] mt-2 whitespace-pre-wrap break-words leading-relaxed font-sans">
                {item.description}
              </p>

              {/* Collapsible Debug Metadata */}
              {isExpanded && (
                <div className="mt-3 pt-2 border-t border-[#333333] text-[11px] text-[#6b6b6b] font-mono space-y-1 bg-[#252526] p-2 rounded">
                  <div>Tab: <span className="text-[#999999]">{item.context.activeTab}</span></div>
                  <div>Target Product: <span className="text-[#999999]">{item.context.activeProductName || item.context.activeProductId || 'None'}</span></div>
                  <div>Payload Size: <span className="text-[#999999]">{item.context.htmlByteLength} bytes</span></div>
                  <div>Platform: <span className="text-[#999999]">{item.context.platform}</span></div>
                  {item.context.unresolvedErrors.length > 0 && (
                    <div className="mt-1">
                      <span className="text-[#f44747]">Linter Warnings:</span>
                      <ul className="list-disc pl-4 mt-0.5 text-[#f44747]/90 space-y-0.5">
                        {item.context.unresolvedErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
