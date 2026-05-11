export interface Tab {
  id: string;
  title: string;
  icon: string;
  type: "dashboard" | "search" | "research" | "custom";
}

export interface Pane {
  id: string;
  title: string;
  flex: number;
  tabs: string[];
}

export interface ShellState {
  currentWorkspace: string;
  tabs: Tab[];
  panes: Pane[];
  watchlists: WatchlistItem[];
}

export interface SearchResult {
  id: string;
  title: string;
  type: "filing" | "report" | "news" | "transcript";
  source: string;
  published_at: string;
  relevance: number;
  preview: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchNote extends Note {
  topic?: string;
  sources?: SearchResult[];
}

export interface AIResponse {
  id: string;
  question: string;
  answer: string;
  sources: SearchResult[];
  confidence: number;
}
