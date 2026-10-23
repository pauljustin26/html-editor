export type EditorViewMode = 'pc' | 'sp';

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
