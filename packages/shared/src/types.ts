export interface Tab {
  id: string;
  title: string;
  icon: string;
  type: "dashboard" | "search" | "research" | "custom";
}

export interface TabState {
  id: string;
  workspaceId: string;
  title: string;
  url: string;
  partition: string;
  pinned: boolean;
}

export interface Pane {
  id: string;
  title: string;
  flex: number;
  tabs: string[];
}

export interface Workspace {
  id: string;
  name: string;
  activeTicker: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  symbols: string[];
}

export interface Headline {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
  url?: string;
}

export interface Filing {
  id: string;
  title: string;
  formType: string;
  ticker: string;
  publishedAt: string;
}

export interface Transcript {
  id: string;
  title: string;
  quarter: string;
  ticker: string;
}

export interface PriceBar {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface ShellState {
  version: number;
  activeWorkspaceId: string;
  activeTabIds: [string, string?];
  tabs: TabState[];
  workspaces: Workspace[];
  bookmarks: Bookmark[];
  watchlist: WatchlistItem[];
  notes: ResearchNote[];
  recentQueries: string[];
  recentActivities: string[];
  aiDraft: string;
  selectedTicker?: string;
  selectedNoteId?: string;
  panes: Pane[];
}

export interface SearchResult {
  id: string;
  title: string;
  type: "filing" | "report" | "news" | "transcript";
  summary: string;
  symbols: string[];
  source: string;
  sourceUrl: string;
  publishedAt: string;
  relevance: number;
}

export interface WatchlistItem {
  id: string;
  workspaceId: string;
  symbol: string;
  label: string;
  createdAt: string;
  pinned?: boolean;
  price?: number;
  change?: number;
  changePercent?: number;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResearchNote extends Note {
  workspaceId: string;
  body: string;
  tags: string[];
  sourceIds: string[];
  updatedAt: string;
  topic?: string;
  sources?: SearchResult[];
}

export interface AIResponse {
  id: string;
  question: string;
  answer: string;
  citations: string[];
  confidence: number;
}
