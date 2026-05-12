import type { AIResponse, Bookmark, Filing, PriceBar, ResearchNote, SearchResult, ShellState, Transcript, WatchlistItem } from "./types";

export const demoShellState: ShellState = {
  version: 1,
  activeWorkspaceId: "main",
  activeTabIds: ["tab-dashboard", "tab-search"],
  tabs: [
    { id: "tab-dashboard", workspaceId: "main", title: "Dashboard", url: "encrypt://dashboard", partition: "persist:main-dashboard", pinned: true },
    { id: "tab-search", workspaceId: "main", title: "Search", url: "encrypt://search", partition: "persist:main-search", pinned: false },
    { id: "tab-research", workspaceId: "main", title: "Research", url: "encrypt://research", partition: "persist:main-research", pinned: false }
  ],
  workspaces: [
    { id: "main", name: "Main", activeTicker: "NVDA" },
    { id: "macro", name: "Macro", activeTicker: "SPY" }
  ],
  bookmarks: [
    { id: "bm-1", title: "NVDA 10-Q", url: "https://www.sec.gov", symbols: ["NVDA"] }
  ],
  watchlist: [],
  notes: [],
  recentQueries: [],
  recentActivities: [],
  aiDraft: "",
  selectedTicker: "NVDA",
  selectedNoteId: undefined,
  panes: [
    { id: "main", title: "Main", flex: 1, tabs: ["tab-dashboard"] },
    { id: "side", title: "Side", flex: 0.3, tabs: ["tab-search", "tab-research"] }
  ],
};

export const demoSearchResults: SearchResult[] = [
  {
    id: "1",
    title: "MSFT vs AAPL: Earnings comparison",
    type: "filing",
    summary: "Microsoft and Apple continue to diverge on cloud and consumer hardware growth.",
    symbols: ["MSFT", "AAPL"],
    source: "SEC",
    sourceUrl: "https://www.sec.gov",
    publishedAt: new Date().toISOString(),
    relevance: 0.95,
  },
  {
    id: "2",
    title: "Tech Sector Analysis Report",
    type: "report",
    summary: "The technology sector continues to show strong growth.",
    symbols: ["QQQ", "XLK"],
    source: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com",
    publishedAt: new Date().toISOString(),
    relevance: 0.87,
  }
];

export const demoTickers: WatchlistItem[] = [
  { id: "1", workspaceId: "main", symbol: "NVDA", label: "NVIDIA", createdAt: new Date().toISOString(), pinned: true, price: 950.10, change: 18.25, changePercent: 1.96 },
  { id: "2", workspaceId: "main", symbol: "BTC", label: "Bitcoin", createdAt: new Date().toISOString(), price: 68420.00, change: 820.00, changePercent: 1.21 },
  { id: "3", workspaceId: "main", symbol: "MSFT", label: "Microsoft", createdAt: new Date().toISOString(), price: 405.00, change: 5.25, changePercent: 1.31 }
];

export const demoBars: PriceBar[] = [
  { ts: "2024-01-01", open: 150, high: 155, low: 148, close: 152, volume: 1000000 },
  { ts: "2024-01-02", open: 152, high: 158, low: 150, close: 156, volume: 1200000 },
  { ts: "2024-01-03", open: 156, high: 160, low: 154, close: 158, volume: 950000 }
];

export const demoHeadlines: SearchResult[] = [
  {
    id: "h1",
    title: "Fed Holds Rates Steady",
    type: "news",
    summary: "Federal Reserve decided to maintain current interest rates.",
    symbols: ["SPY", "QQQ"],
    source: "Reuters",
    sourceUrl: "https://www.reuters.com",
    publishedAt: new Date().toISOString(),
    relevance: 0.92,
  },
  {
    id: "h2",
    title: "Market Reaches All-Time High",
    type: "news",
    summary: "S&P 500 closes at record high following positive earnings.",
    symbols: ["SPY"],
    source: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com",
    publishedAt: new Date().toISOString(),
    relevance: 0.88,
  }
];

export const demoFilings: Filing[] = [
  {
    id: "f1",
    title: "Apple Inc. 10-K Annual Report",
    formType: "10-K",
    ticker: "AAPL",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "f2",
    title: "Tesla Inc. 8-K Current Report",
    formType: "8-K",
    ticker: "TSLA",
    publishedAt: new Date().toISOString(),
  }
];

export const demoTranscripts: Transcript[] = [
  {
    id: "t1",
    title: "Apple Q4 2024 Earnings Call Transcript",
    quarter: "Q4 2024",
    ticker: "AAPL",
  }
];

export const demoBookmarks: Bookmark[] = [];

export const demoNotes: ResearchNote[] = [];

export const demoAiResponse: AIResponse = {
  id: "ai-1",
  question: "What is driving NVDA momentum?",
  answer: "NVDA momentum is being driven by data-center demand, AI inference spend, and strong gross margins.",
  citations: ["NVDA 10-Q", "Q4 earnings call"],
  confidence: 0.91,
};

