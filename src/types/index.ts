export type EditorViewMode = 'pc' | 'sp';

export type AppThemeId = 'vs-dark' | 'vs-light' | 'monokai' | 'hc-black';

export interface ThemeOption {
  id: AppThemeId;
  label: string;
  monacoTheme: string;
  badge: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'vs-dark', label: 'VS Code Dark+', monacoTheme: 'vs-dark', badge: 'Dark' },
  { id: 'vs-light', label: 'VS Code Light+', monacoTheme: 'vs', badge: 'Light' },
  { id: 'monokai', label: 'Monokai', monacoTheme: 'monokai', badge: 'Warm' },
  { id: 'hc-black', label: 'High Contrast', monacoTheme: 'hc-black', badge: 'High Contrast' },
];

export interface ProductRow {
  id: string;
  name: string;
  pcHtml: string;
  spHtml: string;
  modified: boolean;
}

export interface EditorTab {
  id: string;
  label: string;
  html: string;
}

export type SidebarTab = 'images' | 'diagnostics' | 'batch';

export type FeedbackCategory =
  | 'Bug / Linter Error'
  | 'UI/UX Improvement'
  | 'Feature Request';

export interface FeedbackDebugContext {
  activeTab: string;
  activeProductId: string | null;
  activeProductName?: string;
  timestamp: string;
  userAgent: string;
  platform: string;
  diagnosticCount: number;
  unresolvedErrors: string[];
  htmlByteLength: number;
}

export interface FeedbackItem {
  id: string;
  title: string;
  category: FeedbackCategory;
  description: string;
  createdAt: string;
  context: FeedbackDebugContext;
}

export interface AppState {
  html: string;
  products: ProductRow[];
  activeProductId: string | null;
  sidebarTab: SidebarTab;
  sidebarOpen: boolean;
}
