import { useState, useEffect } from 'react';
import { X, MessageSquarePlus, ListFilter, Send, CheckCircle2, Info } from 'lucide-react';
import type { FeedbackCategory, FeedbackItem, FeedbackDebugContext } from '../types';
import { FeedbackQueue } from './FeedbackQueue';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext: Omit<FeedbackDebugContext, 'timestamp'>;
}

const STORAGE_KEY = 'htmleditor_feedback_queue';

const CATEGORIES: FeedbackCategory[] = [
  'Bug / Linter Error',
  'UI/UX Improvement',
  'Feature Request',
];

export function FeedbackModal({ isOpen, onClose, currentContext }: FeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'queue'>('create');
  const [category, setCategory] = useState<FeedbackCategory>('UI/UX Improvement');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [queue, setQueue] = useState<FeedbackItem[]>([]);
  const [submittedAlert, setSubmittedAlert] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch {
      // Storage unavailable or parsing error
    }
  }, []);

  // Sync to LocalStorage
  const saveQueue = (items: FeedbackItem[]) => {
    setQueue(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // LocalStorage error
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newItem: FeedbackItem = {
      id: `FB-${Date.now().toString(36).toUpperCase()}`,
      title: title.trim() || `${category} - ${new Date().toLocaleTimeString()}`,
      category,
      description: description.trim(),
      createdAt: new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      context: {
        ...currentContext,
        timestamp: new Date().toISOString(),
      },
    };

    saveQueue([newItem, ...queue]);
    setTitle('');
    setDescription('');
    setSubmittedAlert(true);
    setTimeout(() => {
      setSubmittedAlert(false);
      setActiveTab('queue');
    }, 900);
  };

  const handleDeleteItem = (id: string) => {
    saveQueue(queue.filter(item => item.id !== id));
  };

  const handleClearQueue = () => {
    if (confirm('Clear all feedback items in queue?')) {
      saveQueue([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#252526] border border-[#474747] rounded-lg shadow-2xl w-[720px] max-w-[95vw] h-[580px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#333333] bg-[#1e1e1e] shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquarePlus size={16} className="text-[#007acc]" />
            <h3 className="text-xs font-semibold text-[#cccccc] tracking-wide uppercase">
              Feedback & Feature Suggestion Pipeline
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#cccccc] p-1 rounded hover:bg-[#2a2d2e] cursor-pointer focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-[#333333] bg-[#252526] px-4 shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === 'create'
                ? 'border-[#007acc] text-[#ffffff]'
                : 'border-transparent text-[#999999] hover:text-[#cccccc]'
            }`}
          >
            <MessageSquarePlus size={14} />
            <span>New Feedback</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === 'queue'
                ? 'border-[#007acc] text-[#ffffff]'
                : 'border-transparent text-[#999999] hover:text-[#cccccc]'
            }`}
          >
            <ListFilter size={14} />
            <span>Feedback Queue</span>
            {queue.length > 0 && (
              <span className="ml-1 text-[10px] bg-[#007acc] text-white px-1.5 py-0.2 rounded-full font-bold">
                {queue.length}
              </span>
            )}
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="flex flex-col h-full p-4 gap-3">
              {/* Category selector */}
              <div>
                <label className="block text-[11px] font-medium text-[#999999] mb-1">
                  Category
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-left px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                        category === cat
                          ? 'border-[#007acc] bg-[#007acc]/15 text-[#ffffff] font-medium'
                          : 'border-[#333333] bg-[#252526] text-[#999999] hover:text-[#cccccc] hover:border-[#474747]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-[11px] font-medium text-[#999999] mb-1">
                  Summary / Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Table borders missing after beautifying Rakuten layout"
                  className="w-full bg-[#252526] text-[#cccccc] text-xs px-3 py-1.5 rounded border border-[#333333] focus:outline-none focus:border-[#007acc] placeholder:text-[#6b6b6b]"
                />
              </div>

              {/* Description textarea */}
              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-[11px] font-medium text-[#999999] mb-1">
                  Detailed Notes & Expected Behavior <span className="text-[#f44747]">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, requested feature, or catalog quirk. Multi-byte Japanese text (日本語) and Excel formatting patterns supported..."
                  className="flex-1 w-full bg-[#252526] text-[#cccccc] text-xs p-3 rounded border border-[#333333] focus:outline-none focus:border-[#007acc] placeholder:text-[#6b6b6b] resize-none leading-relaxed"
                />
              </div>

              {/* Auto-Captured Context Pill */}
              <div className="flex items-center gap-2 p-2 bg-[#252526] border border-[#333333] rounded text-[11px] text-[#999999]">
                <Info size={14} className="text-[#007acc] shrink-0" />
                <span className="truncate">
                  Auto-capturing state: <span className="text-[#cccccc]">{currentContext.platform}</span> mode |{' '}
                  <span className="text-[#cccccc]">{currentContext.htmlByteLength} B</span> HTML |{' '}
                  <span className="text-[#cccccc]">{currentContext.diagnosticCount}</span> diagnostics
                </span>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-1 shrink-0">
                <span className="text-[11px] text-[#6b6b6b]">
                  Saved to browser local storage. Exportable to Markdown anytime.
                </span>

                <button
                  type="submit"
                  disabled={!description.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-[#007acc] text-white font-medium rounded hover:bg-[#1a8ad4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007acc]"
                >
                  {submittedAlert ? (
                    <>
                      <CheckCircle2 size={14} className="text-[#4ec9b0]" />
                      <span>Saved to Queue!</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit to Queue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <FeedbackQueue
              items={queue}
              onDeleteItem={handleDeleteItem}
              onClearQueue={handleClearQueue}
            />
          )}
        </div>
      </div>
    </div>
  );
}
