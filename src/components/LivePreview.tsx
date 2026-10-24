import { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, Monitor, Smartphone, PictureInPicture2, ArrowDownLeft } from 'lucide-react';
import type { EditorViewMode } from '../types';

interface LivePreviewProps {
  pcHtml: string;
  spHtml: string;
  activeView: EditorViewMode;
  onViewChange: (view: EditorViewMode) => void;
}

export function LivePreview({ pcHtml, spHtml, activeView, onViewChange }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const popupRef = useRef<Window | null>(null);
  const [isDetached, setIsDetached] = useState(false);

  const currentHtml = activeView === 'pc' ? pcHtml : spHtml;

  // Helper to build preview document string
  const generatePreviewDoc = useCallback((html: string, mode: EditorViewMode) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
      font-size: ${mode === 'pc' ? '14px' : '13px'};
      line-height: 1.6;
      color: #333;
      background: #fff;
      word-break: break-all;
      overflow-wrap: break-word;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    td, th {
      border: 1px solid #ddd;
      padding: 6px 8px;
    }
  </style>
</head>
<body>${html}</body>
</html>`;
  }, []);

  // Sync embedded iframe
  useEffect(() => {
    if (isDetached) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(generatePreviewDoc(currentHtml, activeView));
    doc.close();
  }, [currentHtml, activeView, isDetached, generatePreviewDoc]);

  // Sync detached popup window
  useEffect(() => {
    if (!isDetached || !popupRef.current || popupRef.current.closed) return;

    try {
      const popup = popupRef.current;
      const targetIframe = popup.document.getElementById('preview-frame') as HTMLIFrameElement | null;
      if (targetIframe && targetIframe.contentDocument) {
        targetIframe.contentDocument.open();
        targetIframe.contentDocument.write(generatePreviewDoc(currentHtml, activeView));
        targetIframe.contentDocument.close();
      }

      // Sync active view buttons in popup header
      const pcBtn = popup.document.getElementById('btn-pc');
      const spBtn = popup.document.getElementById('btn-sp');
      const infoSpan = popup.document.getElementById('view-info');
      const frameWrapper = popup.document.getElementById('frame-wrapper');
      const phoneTop = popup.document.getElementById('phone-top');

      if (pcBtn && spBtn && infoSpan && frameWrapper) {
        if (activeView === 'pc') {
          pcBtn.className = 'btn active';
          spBtn.className = 'btn';
          infoSpan.innerText = 'Desktop Full Width';
          frameWrapper.className = 'pc-wrap';
          if (phoneTop) phoneTop.style.display = 'none';
        } else {
          pcBtn.className = 'btn';
          spBtn.className = 'btn active';
          infoSpan.innerText = 'Mobile 375px Viewport';
          frameWrapper.className = 'sp-wrap';
          if (phoneTop) phoneTop.style.display = 'flex';
        }
      }
    } catch {
      // Popup might be blocked or closed
    }
  }, [currentHtml, activeView, isDetached, generatePreviewDoc]);

  // Open detached separate window
  const handleOpenSeparateWindow = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    const width = 860;
    const height = 900;
    const left = Math.max(window.screenX + window.outerWidth - width, 50);
    const top = Math.max(window.screenY + 50, 50);

    const popup = window.open(
      '',
      'HTMLEditorLivePreviewWindow',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (!popup) {
      alert('Popup window blocked by browser. Please allow popups for this site.');
      return;
    }

    popupRef.current = popup;
    setIsDetached(true);

    const popupDoc = popup.document;
    popupDoc.open();
    popupDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Live Preview — HTML Editor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1e1e1e;
      color: #cccccc;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .header {
      height: 38px;
      background: #252526;
      border-bottom: 1px solid #333333;
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 8px;
      user-select: none;
      shrink: 0;
    }
    .btn {
      background: transparent;
      border: 1px solid transparent;
      color: #999999;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
    }
    .btn.active {
      background: #1e1e1e;
      border-color: #333333;
      color: #ffffff;
      font-weight: 500;
    }
    .btn:hover {
      color: #ffffff;
    }
    .live-badge {
      font-size: 11px;
      color: #4ec9b0;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: monospace;
      margin-left: auto;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4ec9b0;
      box-shadow: 0 0 8px #4ec9b0;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
    .content-area {
      flex: 1;
      background: #141414;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      padding: 12px;
    }
    .pc-wrap {
      width: 100%;
      height: 100%;
      background: #ffffff;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .sp-wrap {
      width: 375px;
      height: 100%;
      max-height: 820px;
      background: #ffffff;
      border-radius: 14px;
      border: 4px solid #2d2d2d;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 30px rgba(0,0,0,0.5);
    }
    .sp-topbar {
      height: 22px;
      background: #252526;
      color: #999999;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      font-family: monospace;
      user-select: none;
      shrink: 0;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="header">
    <button id="btn-pc" class="btn ${activeView === 'pc' ? 'active' : ''}">Desktop (PC)</button>
    <button id="btn-sp" class="btn ${activeView === 'sp' ? 'active' : ''}">Mobile (SP)</button>
    <span id="view-info" style="font-size: 11px; color: #6b6b6b; font-family: monospace; margin-left: 6px;">
      ${activeView === 'pc' ? 'Desktop Full Width' : 'Mobile 375px Viewport'}
    </span>
    <div class="live-badge">
      <div class="live-dot"></div>
      <span>Live Sync</span>
    </div>
  </div>

  <div class="content-area">
    <div id="frame-wrapper" class="${activeView === 'pc' ? 'pc-wrap' : 'sp-wrap'}">
      <div id="phone-top" class="sp-topbar" style="display: ${activeView === 'sp' ? 'flex' : 'none'};">
        <span>9:41</span>
        <div style="width: 48px; height: 10px; background: #1e1e1e; border-radius: 10px;"></div>
        <span>5G 100%</span>
      </div>
      <iframe id="preview-frame" sandbox="allow-same-origin"></iframe>
    </div>
  </div>
</body>
</html>`);
    popupDoc.close();

    // Hook buttons inside popup window to sync view changes
    const pcBtn = popupDoc.getElementById('btn-pc');
    const spBtn = popupDoc.getElementById('btn-sp');
    if (pcBtn) {
      pcBtn.onclick = () => onViewChange('pc');
    }
    if (spBtn) {
      spBtn.onclick = () => onViewChange('sp');
    }

    // Write initial iframe content
    const targetIframe = popupDoc.getElementById('preview-frame') as HTMLIFrameElement | null;
    if (targetIframe && targetIframe.contentDocument) {
      targetIframe.contentDocument.open();
      targetIframe.contentDocument.write(generatePreviewDoc(currentHtml, activeView));
      targetIframe.contentDocument.close();
    }

    // Detect when popup is closed
    const timer = setInterval(() => {
      if (!popupRef.current || popupRef.current.closed) {
        clearInterval(timer);
        setIsDetached(false);
        popupRef.current = null;
      }
    }, 500);

    popup.onbeforeunload = () => {
      setIsDetached(false);
      popupRef.current = null;
    };
  };

  // Re-attach popup back to workspace
  const handleReattach = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
    setIsDetached(false);
  };

  const handleRefresh = () => {
    if (isDetached && popupRef.current && !popupRef.current.closed) {
      const targetIframe = popupRef.current.document.getElementById('preview-frame') as HTMLIFrameElement | null;
      if (targetIframe?.contentDocument) {
        targetIframe.contentDocument.location.reload();
      }
      return;
    }
    const iframe = iframeRef.current;
    if (iframe?.contentDocument) {
      iframe.contentDocument.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Preview tab header */}
      <div className="flex items-center h-8 bg-[#252526] border-b border-[#333333] px-2 shrink-0 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewChange('pc')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeView === 'pc'
                ? 'bg-[#1e1e1e] text-[#ffffff] font-medium border border-[#333333]'
                : 'text-[#999999] hover:text-[#cccccc] border border-transparent'
            }`}
          >
            <Monitor size={13} />
            <span>Desktop (PC)</span>
          </button>

          <button
            onClick={() => onViewChange('sp')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeView === 'sp'
                ? 'bg-[#1e1e1e] text-[#ffffff] font-medium border border-[#333333]'
                : 'text-[#999999] hover:text-[#cccccc] border border-transparent'
            }`}
          >
            <Smartphone size={13} />
            <span>Mobile (SP)</span>
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#6b6b6b] font-mono mr-1">
            {activeView === 'pc' ? 'Full Width' : '375px Viewport'}
          </span>

          <button
            onClick={handleRefresh}
            className="text-[#999999] hover:text-[#cccccc] cursor-pointer p-1 rounded hover:bg-[#2a2d2e] focus:outline-none focus:ring-1 focus:ring-[#007acc]"
            title="Reload preview"
          >
            <RefreshCw size={13} />
          </button>

          {/* Separate window / Picture-in-Picture trigger */}
          <button
            onClick={isDetached ? handleReattach : handleOpenSeparateWindow}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007acc] ${
              isDetached
                ? 'border-[#007acc] bg-[#007acc]/20 text-[#007acc]'
                : 'border-transparent text-[#999999] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
            }`}
            title={isDetached ? 'Re-attach preview to main workspace' : 'Open preview in separate window (Picture-in-Picture)'}
          >
            {isDetached ? <ArrowDownLeft size={13} /> : <PictureInPicture2 size={13} />}
            <span className="hidden sm:inline">{isDetached ? 'Re-attach' : 'Separate Window'}</span>
          </button>
        </div>
      </div>

      {/* Render area */}
      {isDetached ? (
        // Detached state placeholder card
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#181818]">
          <div className="w-14 h-14 rounded-full bg-[#252526] border border-[#333333] flex items-center justify-center mb-3 text-[#007acc]">
            <PictureInPicture2 size={24} />
          </div>
          <h4 className="text-sm font-semibold text-[#cccccc]">Preview Active in Separate Window</h4>
          <p className="text-xs text-[#999999] mt-1 max-w-xs leading-relaxed">
            Live preview is rendering in a detached floating window. Real-time edits to PC and SP HTML continue to sync automatically.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => popupRef.current?.focus()}
              className="px-3 py-1 text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#cccccc] rounded border border-[#474747] transition-colors cursor-pointer"
            >
              Focus Window
            </button>
            <button
              onClick={handleReattach}
              className="px-3 py-1 text-xs bg-[#007acc] hover:bg-[#1a8ad4] text-white rounded font-medium transition-colors cursor-pointer"
            >
              Re-attach to Workspace
            </button>
          </div>
        </div>
      ) : (
        // Embedded mode
        <div className="flex-1 overflow-auto bg-[#181818] p-2 flex items-center justify-center">
          {activeView === 'pc' ? (
            <div className="w-full h-full bg-white shadow-md overflow-hidden">
              <iframe
                ref={iframeRef}
                sandbox="allow-same-origin"
srcDoc={generatePreviewDoc(currentHtml, activeView)}
                title="Desktop HTML Preview"
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="w-[375px] h-full max-h-[820px] bg-white rounded-xl shadow-2xl border-4 border-[#2d2d2d] flex flex-col overflow-hidden">
              <div className="h-5 bg-[#252526] text-[#999999] text-[10px] flex items-center justify-between px-3 select-none shrink-0 font-mono">
                <span>9:41</span>
                <div className="w-12 h-2.5 bg-[#1e1e1e] rounded-full" />
                <span>5G 100%</span>
              </div>
              <iframe
                ref={iframeRef}
                sandbox="allow-same-origin"
srcDoc={generatePreviewDoc(currentHtml, activeView)}
                title="Mobile (SP) HTML Preview"
                className="flex-1 w-full border-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
