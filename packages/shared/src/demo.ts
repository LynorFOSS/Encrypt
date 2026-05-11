import type { ShellState, SearchResult, WatchlistItem, Note, AIResponse } from "./types";

export const demoShellState: ShellState = {
  currentWorkspace: "main",
  tabs: [
    { id: "1", title: "Dashboard", icon: "📊", type: "dashboard" },
    { id: "2", title: "Search", icon: "🔍", type: "search" },
    { id: "3", title: "Research", icon: "📑", type: "research" }
  ],
  panes: [
    { id: "main", title: "Main", flex: 1, tabs: ["1"] },
    { id: "side", title: "Side", flex: 0.3, tabs: ["2", "3"] }
  ],
  watchlists: []
};

export const demoSearchResults: SearchResult[] = [
  {
    id: "1",
    title: "Apple Inc. Q4 2024 Earnings",
    type: "filing",
    source: "SEC",
    published_at: new Date().toISOString(),
    relevance: 0.95,
    preview: "Apple reported record revenue in Q4 2024..."
  },
  {
    id: "2",
    title: "Tech Sector Analysis Report",
    type: "report",
    source: "Bloomberg",
    published_at: new Date().toISOString(),
    relevance: 0.87,
    preview: "The technology sector continues to show strong growth..."
  }
];

export const demoTickers: WatchlistItem[] = [
  { id: "1", symbol: "AAPL", name: "Apple Inc.", price: 195.50, change: 2.50, changePercent: 1.30 },
  { id: "2", symbol: "MSFT", name: "Microsoft", price: 405.00, change: 5.25, changePercent: 1.31 },
  { id: "3", symbol: "GOOGL", name: "Alphabet Inc.", price: 165.75, change: -1.25, changePercent: -0.75 }
];

export const demoBars = [
  { time: "2024-01-01", open: 150, high: 155, low: 148, close: 152, volume: 1000000 },
  { time: "2024-01-02", open: 152, high: 158, low: 150, close: 156, volume: 1200000 },
  { time: "2024-01-03", open: 156, high: 160, low: 154, close: 158, volume: 950000 }
];

export const demoHeadlines: SearchResult[] = [
  {
    id: "h1",
    title: "Fed Holds Rates Steady",
    type: "news",
    source: "Reuters",
    published_at: new Date().toISOString(),
    relevance: 0.92,
    preview: "Federal Reserve decided to maintain current interest rates..."
  },
  {
    id: "h2",
    title: "Market Reaches All-Time High",
    type: "news",
    source: "Bloomberg",
    published_at: new Date().toISOString(),
    relevance: 0.88,
    preview: "S&P 500 closes at record high following positive earnings..."
  }
];

export const demoFilings: SearchResult[] = [
  {
    id: "f1",
    title: "Apple Inc. 10-K Annual Report",
    type: "filing",
    source: "SEC",
    published_at: new Date().toISOString(),
    relevance: 0.98,
    preview: "Annual financial report for fiscal year 2024..."
  },
  {
    id: "f2",
    title: "Tesla Inc. 8-K Current Report",
    type: "filing",
    source: "SEC",
    published_at: new Date().toISOString(),
    relevance: 0.85,
    preview: "Current report of material events or changes..."
  }
];

export const demoTranscripts: SearchResult[] = [
  {
    id: "t1",
    title: "Apple Q4 2024 Earnings Call Transcript",
    type: "transcript",
    source: "Seeking Alpha",
    published_at: new Date().toISOString(),
    relevance: 0.94,
    preview: "Management discussion on quarterly performance..."
  }
];

