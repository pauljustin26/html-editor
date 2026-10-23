import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Monitor, Smartphone } from 'lucide-react';
import { Toolbar } from './components/Toolbar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { LivePreview } from './components/LivePreview';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { ImageManager } from './components/ImageManager';
import { BatchModal } from './components/BatchModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Sidebar } from './components/Sidebar';
import { SplitPane } from './components/SplitPane';
import { StatusBar } from './components/StatusBar';
import { lintHTML } from './utils/htmlLinter';
import type { LintDiagnostic } from './utils/htmlLinter';
import { extractImages, replaceImageUrls } from './utils/imageExtractor';
import type { ImageInfo } from './utils/imageExtractor';
import { beautifyHTML, minifyHTML, cleanWordHTML } from './utils/htmlFormatter';
import { getBreadcrumbs } from './utils/breadcrumbParser';
import type { BreadcrumbNode } from './utils/breadcrumbParser';
import { useDebounce } from './hooks/useDebounce';
import { THEME_OPTIONS, type ProductRow, type SidebarTab, type EditorViewMode, type AppThemeId } from './types';

const DEFAULT_PC_HTML = `<!-- Desktop HTML Layout -->
<section style="max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; padding: 20px;">
  <header style="border-bottom: 2px solid #007acc; padding-bottom: 10px; margin-bottom: 20px;">
    <h1 style="font-size: 24px; color: #111; margin: 0;">Modern Web Component</h1>
    <p style="font-size: 14px; color: #666; margin: 6px 0 0;">Clean, modular HTML designed for desktop viewing.</p>
  </header>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px;">
      <h3 style="font-size: 16px; margin-top: 0;">Feature Highlights</h3>
      <ul style="font-size: 13px; color: #444; padding-left: 20px; line-height: 1.6;">
        <li>High-performance layout</li>
        <li>Accessible contrast structure</li>
        <li>Fully responsive grid</li>
      </ul>
    </div>
    <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px;">
      <h3 style="font-size: 16px; margin-top: 0;">Specifications</h3>
      <p style="font-size: 13px; color: #555; line-height: 1.5;">Dimensions, attributes, and custom metadata blocks go here.</p>
    </div>
  </div>
</section>`;

const DEFAULT_SP_HTML = `<!-- Mobile HTML Layout -->
<div style="width: 100%; font-family: system-ui, sans-serif; padding: 12px; box-sizing: border-box;">
  <div style="background: #007acc; color: #fff; padding: 14px; border-radius: 8px; text-align: center; margin-bottom: 12px;">
    <h2 style="font-size: 18px; margin: 0;">Mobile Responsive Card</h2>
    <p style="font-size: 12px; opacity: 0.9; margin: 4px 0 0;">Optimized for smartphone screens</p>
  </div>
  <p style="font-size: 13px; color: #444; line-height: 1.6;">
    Vertical single-column layout with touch-friendly elements and fluid viewport scaling.
  </p>
  <div style="margin-top: 16px;">
    <button style="width: 100%; background: #111; color: #fff; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer;">
      Primary Action
    </button>
  </div>
</div>`;

export default function App() {
  // Dual code state: PC and SP (Smartphone)
  const [pcHtml, setPcHtml] = useState(DEFAULT_PC_HTML);
  const [spHtml, setSpHtml] = useState(DEFAULT_SP_HTML);
  const [editorMode, setEditorMode] = useState<EditorViewMode>('pc');
  const [previewMode, setPreviewMode] = useState<EditorViewMode>('pc');

  // Active code pointer
  const activeHtml = editorMode === 'pc' ? pcHtml : spHtml;

  // Refs to always have current values (avoids stale closures in callbacks)
  const pcHtmlRef = useRef(pcHtml);
  pcHtmlRef.current = pcHtml;
  const spHtmlRef = useRef(spHtml);
  spHtmlRef.current = spHtml;
  const editorModeRef = useRef(editorMode);
  editorModeRef.current = editorMode;

  // Theme state with LocalStorage persistence
  const [theme, setTheme] = useState<AppThemeId>(() => {
    try {
      const saved = localStorage.getItem('htmleditor_theme');
      return (saved as AppThemeId) || 'vs-dark';
    } catch {
      return 'vs-dark';
    }
  });

  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('images');
  const [batchOpen, setBatchOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [platform, setPlatform] = useState('standard');

  // Editor ref
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Sync theme changes to document body & Monaco
  const handleThemeChange = useCallback((newTheme: AppThemeId) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('htmleditor_theme', newTheme);
    } catch {
      // Storage unavailable
    }
    document.documentElement.setAttribute('data-theme', newTheme);

    const monacoThemeName = THEME_OPTIONS.find(t => t.id === newTheme)?.monacoTheme || 'vs-dark';
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(monacoThemeName);
    }
  }, []);

  // Set initial theme attribute on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global shortcut for Feedback (Ctrl+Shift+F or Cmd+Shift+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setFeedbackOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced active HTML for linting & image parsing
  const debouncedActiveHtml = useDebounce(activeHtml, 300);
  const debouncedPcHtml = useDebounce(pcHtml, 300);
  const debouncedSpHtml = useDebounce(spHtml, 300);

  // Derived state
  const diagnostics = useMemo(() => lintHTML(debouncedActiveHtml), [debouncedActiveHtml]);
  const images = useMemo(() => extractImages(debouncedActiveHtml), [debouncedActiveHtml]);

  // Cursor breadcrumbs
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbNode[]>([]);

  // Update Monaco markers
  const updateMarkers = useCallback((diags: LintDiagnostic[], monaco: Monaco | null, ed: editor.IStandaloneCodeEditor | null) => {
    if (!monaco || !ed) return;
    const model = ed.getModel();
    if (!model) return;

    const markers: editor.IMarkerData[] = diags.map(d => ({
      severity: d.severity === 'error'
        ? monaco.MarkerSeverity.Error
        : d.severity === 'warning'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info,
      message: d.message,
      startLineNumber: d.line,
      startColumn: d.column,
      endLineNumber: d.endLine,
      endColumn: d.endColumn,
    }));

    monaco.editor.setModelMarkers(model, 'html-linter', markers);
  }, []);

  useMemo(() => {
    updateMarkers(diagnostics, monacoRef.current, editorRef.current);
  }, [diagnostics, updateMarkers]);

  // Editor mount & custom theme registration
  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register Monokai theme definition
    monaco.editor.defineTheme('monokai', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '75715e' },
        { token: 'tag', foreground: 'f92672' },
        { token: 'tag.id', foreground: 'a6e22e' },
        { token: 'tag.class', foreground: 'a6e22e' },
        { token: 'attribute.name', foreground: 'a6e22e' },
        { token: 'attribute.value', foreground: 'e6db74' },
        { token: 'string', foreground: 'e6db74' },
        { token: 'delimiter', foreground: 'f8f8f2' },
      ],
      colors: {
        'editor.background': '#272822',
        'editor.foreground': '#f8f8f2',
        'editorCursor.foreground': '#f8f8f0',
        'editor.lineHighlightBackground': '#3e3d32',
        'editorLineNumber.foreground': '#90908a',
        'editorLineNumber.activeForeground': '#c2c2bf',
      },
    });

    // Apply current theme
    const activeMonacoTheme = THEME_OPTIONS.find(t => t.id === theme)?.monacoTheme || 'vs-dark';
    monaco.editor.setTheme(activeMonacoTheme);

    monaco.languages.html?.htmlDefaults?.setOptions?.({
      suggest: { html5: true },
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorLine(e.position.lineNumber);
      setCursorColumn(e.position.column);

      const model = editor.getModel();
      if (model) {
        const offset = model.getOffsetAt(e.position);
        const crumbs = getBreadcrumbs(model.getValue(), offset);
        setBreadcrumbs(crumbs);
      }
    });

    updateMarkers(lintHTML(activeHtml), monaco, editor);
  }, [activeHtml, theme, updateMarkers]);

  // Editor content change
  const handleEditorChange = useCallback((value: string | undefined) => {
    const val = value ?? '';
    const currentMode = editorModeRef.current;
    if (currentMode === 'pc') {
      setPcHtml(val);
    } else {
      setSpHtml(val);
    }

    if (activeProductId) {
      setProducts(prev =>
        prev.map(p =>
          p.id === activeProductId
            ? { ...p, [currentMode === 'pc' ? 'pcHtml' : 'spHtml']: val, modified: true }
            : p
        )
      );
    }
  }, [activeProductId]);

  // Switching editor mode between PC and SP
  const switchEditorMode = useCallback((mode: EditorViewMode) => {
    // IMPORTANT: Update the ref synchronously BEFORE setValue,
    // because setValue triggers onChange which reads editorModeRef
    editorModeRef.current = mode;
    setEditorMode(mode);
    setPreviewMode(mode);
    const nextHtml = mode === 'pc' ? pcHtmlRef.current : spHtmlRef.current;
    if (editorRef.current && editorRef.current.getValue() !== nextHtml) {
      editorRef.current.setValue(nextHtml);
    }
  }, []);

  // Navigation helpers
  const goToLine = useCallback((line: number, column: number = 1) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column });
    editor.focus();
  }, []);

  const highlightRange = useCallback((startLine: number, startCol: number, endLine: number, endCol: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.revealLineInCenter(startLine);
    editor.setSelection({
      startLineNumber: startLine,
      startColumn: startCol,
      endLineNumber: endLine,
      endColumn: endCol,
    });
    editor.focus();
  }, []);

  // Formatters
  const handleBeautify = useCallback(() => {
    const formatted = beautifyHTML(activeHtml);
    if (editorMode === 'pc') setPcHtml(formatted);
    else setSpHtml(formatted);

    if (editorRef.current && editorRef.current.getValue() !== formatted) {
      editorRef.current.setValue(formatted);
    }
  }, [activeHtml, editorMode]);

  const handleMinify = useCallback(() => {
    const minified = minifyHTML(activeHtml);
    if (editorMode === 'pc') setPcHtml(minified);
    else setSpHtml(minified);

    if (editorRef.current && editorRef.current.getValue() !== minified) {
      editorRef.current.setValue(minified);
    }
  }, [activeHtml, editorMode]);

  const handleCleanWord = useCallback(() => {
    const cleaned = cleanWordHTML(activeHtml);
    if (editorMode === 'pc') setPcHtml(cleaned);
    else setSpHtml(cleaned);

    if (editorRef.current && editorRef.current.getValue() !== cleaned) {
      editorRef.current.setValue(cleaned);
    }
  }, [activeHtml, editorMode]);

  const handleCopyHTML = useCallback(() => {
    navigator.clipboard.writeText(activeHtml).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = activeHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }, [activeHtml]);

  const handleClear = useCallback(() => {
    if (editorMode === 'pc') setPcHtml('');
    else setSpHtml('');

    if (editorRef.current) {
      editorRef.current.setValue('');
    }
  }, [editorMode]);

  const handleDiagnosticClick = useCallback((diag: LintDiagnostic) => {
    highlightRange(diag.line, diag.column, diag.endLine, diag.endColumn);
  }, [highlightRange]);

  const handleImageClick = useCallback((image: ImageInfo) => {
    goToLine(image.line, image.column);
  }, [goToLine]);

  const handleReplaceUrls = useCallback((search: string, replace: string, useRegex: boolean) => {
    const result = replaceImageUrls(activeHtml, search, replace, useRegex);
    if (editorMode === 'pc') setPcHtml(result.html);
    else setSpHtml(result.html);

    if (editorRef.current) {
      editorRef.current.setValue(result.html);
    }
  }, [activeHtml, editorMode]);

  const handleBreadcrumbClick = useCallback((node: BreadcrumbNode) => {
    goToLine(node.line, 1);
  }, [goToLine]);

  const handleSelectProduct = useCallback((id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setPcHtml(product.pcHtml);
      setSpHtml(product.spHtml);
      setActiveProductId(id);
      const val = editorMode === 'pc' ? product.pcHtml : product.spHtml;
      if (editorRef.current) editorRef.current.setValue(val);
    }
  }, [products, editorMode]);

  const activeMonacoTheme = THEME_OPTIONS.find(t => t.id === theme)?.monacoTheme || 'vs-dark';

  // Editor Left Pane
  const editorPane = (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-8 bg-[#252526] border-b border-[#333333] px-2 shrink-0 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => switchEditorMode('pc')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
              editorMode === 'pc'
                ? 'bg-[#1e1e1e] text-[#ffffff] font-medium border border-[#333333]'
                : 'text-[#999999] hover:text-[#cccccc] border border-transparent'
            }`}
          >
            <Monitor size={13} className={editorMode === 'pc' ? 'text-[#007acc]' : ''} />
            <span>Desktop HTML</span>
          </button>

          <button
            onClick={() => switchEditorMode('sp')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
              editorMode === 'sp'
                ? 'bg-[#1e1e1e] text-[#ffffff] font-medium border border-[#333333]'
                : 'text-[#999999] hover:text-[#cccccc] border border-transparent'
            }`}
          >
            <Smartphone size={13} className={editorMode === 'sp' ? 'text-[#007acc]' : ''} />
            <span>Mobile HTML</span>
          </button>
        </div>

        <div className="flex-1" />

        {activeProductId && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#999999] truncate max-w-[150px]">
              {products.find(p => p.id === activeProductId)?.name}
            </span>
            <button
              onClick={() => {
                setActiveProductId(null);
                setPcHtml(DEFAULT_PC_HTML);
                setSpHtml(DEFAULT_SP_HTML);
                if (editorRef.current) {
                  editorRef.current.setValue(editorMode === 'pc' ? DEFAULT_PC_HTML : DEFAULT_SP_HTML);
                }
              }}
              className="text-[10px] text-[#6b6b6b] hover:text-[#cccccc] cursor-pointer rounded px-1"
            >
              ✕ Detach
            </button>
          </div>
        )}
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="html"
          value={activeHtml}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={activeMonacoTheme}
          options={{
            fontSize: 13,
            fontFamily: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
            minimap: { enabled: true, maxColumn: 80 },
            lineNumbers: 'on',
            bracketPairColorization: { enabled: true },
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnPaste: false,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderWhitespace: 'boundary',
            tabSize: 2,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            folding: true,
            foldingStrategy: 'indentation',
            links: true,
            unicodeHighlight: { ambiguousCharacters: false },
            padding: { top: 8 },
          }}
        />
      </div>
    </div>
  );

  // Preview Right Pane
  const previewPane = (
    <LivePreview
      pcHtml={debouncedPcHtml}
      spHtml={debouncedSpHtml}
      activeView={previewMode}
      onViewChange={setPreviewMode}
    />
  );

  // Sidebar content
  const sidebarContent = sidebarTab === 'images' ? (
    <ImageManager
      images={images}
      onImageClick={handleImageClick}
      onReplaceUrls={handleReplaceUrls}
    />
  ) : (
    <DiagnosticsPanel
      diagnostics={diagnostics}
      onDiagnosticClick={handleDiagnosticClick}
    />
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e]">
      {/* Top toolbar */}
      <Toolbar
        pcHtml={pcHtml}
        spHtml={spHtml}
        activeMode={editorMode}
        theme={theme}
        onThemeChange={handleThemeChange}
        onBeautify={handleBeautify}
        onMinify={handleMinify}
        onCleanWord={handleCleanWord}
        onCopyHTML={handleCopyHTML}
        onClear={handleClear}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs nodes={breadcrumbs} onNodeClick={handleBreadcrumbClick} />

      {/* Main split area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <SplitPane
            left={editorPane}
            right={previewPane}
            defaultSplit={50}
          />
        </div>

        {/* Right sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarContent}
        </Sidebar>
      </div>

      {/* Status bar */}
      <StatusBar
        line={cursorLine}
        column={cursorColumn}
        encoding="UTF-8"
        diagnosticCount={diagnostics.length}
        platform={platform}
        onPlatformChange={setPlatform}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* Batch modal */}
      <BatchModal
        isOpen={batchOpen}
        onClose={() => setBatchOpen(false)}
        products={products}
        onProductsChange={setProducts}
        onSelectProduct={handleSelectProduct}
      />

      {/* Feedback modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        currentContext={{
          activeTab: `${sidebarTab} (Editing: ${editorMode.toUpperCase()})`,
          activeProductId,
          activeProductName: products.find(p => p.id === activeProductId)?.name,
          userAgent: navigator.userAgent,
          platform,
          diagnosticCount: diagnostics.length,
          unresolvedErrors: diagnostics.slice(0, 5).map(d => `Ln ${d.line}: ${d.message}`),
          htmlByteLength: new TextEncoder().encode(activeHtml).length,
        }}
      />
    </div>
  );
}
