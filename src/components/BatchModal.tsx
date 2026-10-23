import { useState, useRef } from 'react';
import { X, Download, ClipboardPaste, Copy, Edit3, Check } from 'lucide-react';
import type { ProductRow } from '../types';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductRow[];
  onProductsChange: (products: ProductRow[]) => void;
  onSelectProduct: (id: string) => void;
}

export function BatchModal({ isOpen, onClose, products, onProductsChange, onSelectProduct }: BatchModalProps) {
  const [pasteText, setPasteText] = useState('');
  const _textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  function handlePaste() {
    if (!pasteText.trim()) return;

    const lines = pasteText.trim().split('\n');
    const newProducts: ProductRow[] = lines.map((line, i) => {
      const parts = line.split('\t');
      if (parts.length >= 3) {
        return {
          id: crypto.randomUUID(),
          name: parts[0].trim() || `Item ${products.length + i + 1}`,
          pcHtml: parts[1].trim(),
          spHtml: parts[2].trim(),
          modified: false,
        };
      }
      if (parts.length === 2) {
        return {
          id: crypto.randomUUID(),
          name: parts[0].trim() || `Item ${products.length + i + 1}`,
          pcHtml: parts[1].trim(),
          spHtml: parts[1].trim(),
          modified: false,
        };
      }
      return {
        id: crypto.randomUUID(),
        name: `Item ${products.length + i + 1}`,
        pcHtml: line.trim(),
        spHtml: line.trim(),
        modified: false,
      };
    });

    onProductsChange([...products, ...newProducts]);
    setPasteText('');
  }

  function handleExportAll() {
    const tsv = products.map(p => `${p.name}\t${p.pcHtml}\t${p.spHtml}`).join('\n');
    navigator.clipboard.writeText(tsv).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = tsv;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }

  function handleExportColumn(field: 'pc' | 'sp') {
    const htmlOnly = products.map(p => (field === 'pc' ? p.pcHtml : p.spHtml)).join('\n');
    navigator.clipboard.writeText(htmlOnly).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = htmlOnly;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }

  function removeProduct(id: string) {
    onProductsChange(products.filter(p => p.id !== id));
  }

  function clearAll() {
    onProductsChange([]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#252526] border border-[#474747] rounded-lg shadow-2xl w-[900px] max-w-[95vw] max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#333333] shrink-0">
          <h2 className="text-sm font-semibold text-[#cccccc]">Spreadsheet Batch Mode</h2>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#cccccc] cursor-pointer p-1 rounded
              focus:outline-none focus:ring-1 focus:ring-[#007acc]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#333333] shrink-0">
            <label className="text-[11px] text-[#999999] block mb-1">
              Paste spreadsheet data (Name → Desktop HTML → Mobile HTML, tab-separated):
            </label>
            <textarea
              ref={_textareaRef}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder={"Product 1\t<div>PC HTML...</div>\t<div>SP Mobile HTML...</div>"}
              rows={3}
              className="w-full bg-[#1e1e1e] text-[#cccccc] text-[12px] font-mono p-2 rounded border border-[#474747]
                focus:outline-none focus:border-[#007acc] placeholder:text-[#4a4a4a] resize-none"
            />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button
                onClick={handlePaste}
                disabled={!pasteText.trim()}
                className="flex items-center gap-1 px-3 py-1 text-[11px] bg-[#007acc] text-white rounded
                  hover:bg-[#1a8ad4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                  focus:outline-none focus:ring-1 focus:ring-[#007acc]"
              >
                <ClipboardPaste size={12} /> Import Rows
              </button>
              <div className="flex-1" />
              <button
                onClick={handleExportAll}
                disabled={products.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#cccccc] bg-[#3c3c3c] rounded
                  hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Copy size={12} /> Copy All (TSV)
              </button>
              <button
                onClick={() => handleExportColumn('pc')}
                disabled={products.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#cccccc] bg-[#3c3c3c] rounded
                  hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download size={12} /> Copy PC Col
              </button>
              <button
                onClick={() => handleExportColumn('sp')}
                disabled={products.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#cccccc] bg-[#3c3c3c] rounded
                  hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download size={12} /> Copy SP Col
              </button>
              {products.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#f44747] bg-[#3c3c3c] rounded
                    hover:bg-[#4a4a4a] cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {products.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-[12px] text-[#6b6b6b]">
                No products loaded. Paste spreadsheet data above.
              </div>
            ) : (
              <table className="w-full text-[12px]">
                <thead className="bg-[#2d2d2d] sticky top-0">
                  <tr className="text-left text-[11px] text-[#999999]">
                    <th className="px-3 py-1.5 w-8">#</th>
                    <th className="px-3 py-1.5 w-40">Name</th>
                    <th className="px-3 py-1.5">PC HTML</th>
                    <th className="px-3 py-1.5">SP HTML</th>
                    <th className="px-3 py-1.5 w-16">Status</th>
                    <th className="px-3 py-1.5 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {products.map((product, i) => (
                    <tr key={product.id} className="hover:bg-[#2a2d2e] transition-colors">
                      <td className="px-3 py-1.5 text-[#6b6b6b]">{i + 1}</td>
                      <td className="px-3 py-1.5 text-[#cccccc] truncate max-w-[150px]">{product.name}</td>
                      <td className="px-3 py-1.5 text-[#6b6b6b] truncate max-w-[200px] font-mono">
                        {product.pcHtml.substring(0, 60)}{product.pcHtml.length > 60 ? '...' : ''}
                      </td>
                      <td className="px-3 py-1.5 text-[#6b6b6b] truncate max-w-[200px] font-mono">
                        {product.spHtml.substring(0, 60)}{product.spHtml.length > 60 ? '...' : ''}
                      </td>
                      <td className="px-3 py-1.5">
                        {product.modified ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#cca700] bg-[#cca700]/10 px-1 py-0.5 rounded">
                            <Edit3 size={9} /> Mod
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#4ec9b0] bg-[#4ec9b0]/10 px-1 py-0.5 rounded">
                            <Check size={9} /> OK
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onSelectProduct(product.id);
                              onClose();
                            }}
                            className="px-1.5 py-0.5 text-[10px] text-[#007acc] hover:bg-[#007acc]/20 rounded cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="px-1.5 py-0.5 text-[10px] text-[#f44747] hover:bg-[#f44747]/20 rounded cursor-pointer"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
