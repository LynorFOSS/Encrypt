import { create } from "zustand";
import { demoBars, demoFilings, demoHeadlines, demoSearchResults, demoShellState, demoTickers, demoTranscripts } from "@encrypt/shared";
import type { AIResponse, ResearchNote, SearchResult, ShellState } from "@encrypt/shared";

export type PaneCommand = "command-palette" | "focus-omnibox" | "new-tab" | "split-pane";

interface ShellStore extends ShellState {
  hydrated: boolean;
  browserAction?: { action: string; url: string; title: string };
  chartSeries: typeof demoBars;
  tickers: typeof demoTickers;
  headlines: typeof demoHeadlines;
  filings: typeof import("@encrypt/shared").demoFilings;
  transcripts: typeof demoTranscripts;
  searchResults: SearchResult[];
  aiResponse?: AIResponse;
  commandPaletteOpen: boolean;
  activeSearchQuery: string;
  activeTabId: string;
  selectedNoteId?: string;
  activePaneCount: 1 | 2;
  actions: {
    hydrate: () => Promise<void>;
    persist: () => Promise<void>;
    setActiveWorkspace: (workspaceId: string) => void;
    setActiveTicker: (symbol: string) => void;
    setSearchQuery: (query: string) => Promise<void>;
    selectSearchResult: (result: SearchResult) => void;
    upsertRecentQuery: (query: string) => void;
    addWatchlistItem: (symbol: string, label: string) => void;
    saveResearchNote: (note: ResearchNote) => void;
    openTab: (url?: string, title?: string) => void;
    navigateTab: (tabId: string, url: string, title?: string) => void;
    closeTab: (tabId: string) => void;
    setBrowserAction: (action?: ShellStore["browserAction"]) => void;
    handleShortcut: (command: string) => void;
    updateAiDraft: (draft: string) => void;
    updateAiResponse: (response?: AIResponse) => void;
    toggleCommandPalette: (open?: boolean) => void;
    toggleSplitPane: () => void;
    setActiveTab: (tabId: string) => void;
  };
}

const defaultState = demoShellState;

export const useShellStore = create<ShellStore>((set, get) => ({
  ...defaultState,
  hydrated: false,
  chartSeries: demoBars,
  tickers: demoTickers,
  headlines: demoHeadlines,
  filings: demoFilings,
  transcripts: demoTranscripts,
  searchResults: demoSearchResults,
  commandPaletteOpen: false,
  activeSearchQuery: "",
  activeTabId: defaultState.activeTabIds[0],
  activePaneCount: 2,
  actions: {
    hydrate: async () => {
      if (!window.encrypt) {
        return;
      }
      const raw = await window.encrypt.loadState();
      if (!raw) {
        set({ hydrated: true });
        return;
      }
      try {
        const parsed = JSON.parse(raw) as ShellState;
        set({ ...parsed, hydrated: true, chartSeries: demoBars, tickers: demoTickers, headlines: demoHeadlines, filings: demoFilings, transcripts: demoTranscripts, searchResults: demoSearchResults, commandPaletteOpen: false, activeSearchQuery: "", activeTabId: parsed.activeTabIds[0], activePaneCount: parsed.activeTabIds[1] ? 2 : 1 });
      } catch {
        set({ hydrated: true });
      }
    },
    persist: async () => {
      if (!window.encrypt) {
        return;
      }
      const state = get();
      await window.encrypt.saveState(JSON.stringify({
        version: state.version,
        activeWorkspaceId: state.activeWorkspaceId,
        activeTabIds: state.activeTabIds,
        tabs: state.tabs,
        panes: state.panes,
        workspaces: state.workspaces,
        bookmarks: state.bookmarks,
        watchlist: state.watchlist,
        notes: state.notes,
        recentQueries: state.recentQueries,
        recentActivities: state.recentActivities,
        aiDraft: state.aiDraft,
        selectedTicker: state.selectedTicker,
      } satisfies ShellState));
    },
    setActiveWorkspace: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
    setActiveTicker: (symbol) => set({ selectedTicker: symbol }),
    setSearchQuery: async (query) => {
      set({ activeSearchQuery: query });
      if (!query.trim()) {
        set({ searchResults: demoSearchResults });
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_SEARCH_URL ?? "http://localhost:8001"}/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const payload = (await response.json()) as { data: SearchResult[] };
        set({ searchResults: payload.data ?? demoSearchResults });
        return;
      }
      const results = demoSearchResults.filter((result) => result.title.toLowerCase().includes(query.toLowerCase()) || result.summary.toLowerCase().includes(query.toLowerCase()) || result.symbols.some((symbol) => symbol.toLowerCase().includes(query.toLowerCase())));
      set({ searchResults: results.length ? results : demoSearchResults });
    },
    selectSearchResult: (result) => set((state) => ({
      selectedTicker: result.symbols[0] ?? state.selectedTicker,
      recentQueries: [result.title, ...state.recentQueries].slice(0, 8),
    })),
    upsertRecentQuery: (query) => set((state) => ({ recentQueries: [query, ...state.recentQueries.filter((existing) => existing !== query)].slice(0, 8) })),
    addWatchlistItem: (symbol, label) => set((state) => ({
      watchlist: [
        {
          id: `wl-${symbol}-${Date.now()}`,
          workspaceId: state.activeWorkspaceId,
          symbol,
          label,
          createdAt: new Date().toISOString(),
        },
        ...state.watchlist,
      ],
      recentActivities: [`Added ${symbol} to watchlist`, ...state.recentActivities].slice(0, 8),
    })),
    saveResearchNote: (note) => set((state) => ({
      notes: [note, ...state.notes.filter((existing) => existing.id !== note.id)],
      selectedNoteId: note.id,
      recentActivities: [`Saved note: ${note.title}`, ...state.recentActivities].slice(0, 8),
      bookmarks: state.bookmarks,
    })),
    openTab: (url = "encrypt://research", title = "Research tab") => set((state) => {
      const tabId = `tab-${Date.now()}`;
      const tab = {
        id: tabId,
        workspaceId: state.activeWorkspaceId,
        title,
        url,
        partition: `persist:${state.activeWorkspaceId}-${tabId}`,
        pinned: false,
      };
      return {
        tabs: [tab, ...state.tabs],
        activeTabId: tabId,
        activeTabIds: [tabId, state.activeTabIds[1]],
        recentActivities: [`Opened ${title}`, ...state.recentActivities].slice(0, 8),
      };
    }),
    navigateTab: (tabId, url, title) => set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, url, title: title ?? tab.title } : tab)),
      activeTabId: state.activeTabId === tabId ? tabId : state.activeTabId,
      recentActivities: [`Navigated to ${url}`, ...state.recentActivities].slice(0, 8),
    })),
    closeTab: (tabId) => set((state) => {
      const remainingTabs = state.tabs.filter((tab) => tab.id !== tabId);
      const fallbackTab = remainingTabs[0] ?? state.tabs[0];
      const nextActive = state.activeTabId === tabId ? fallbackTab?.id ?? state.activeTabId : state.activeTabId;
      return {
        tabs: remainingTabs,
        activeTabId: nextActive,
        activeTabIds: [nextActive, state.activeTabIds[1] === tabId ? fallbackTab?.id : state.activeTabIds[1]].filter(Boolean) as [string, string?],
      };
    }),
    setBrowserAction: (browserAction) => set({ browserAction }),
    handleShortcut: (command) => {
      if (command === "command-palette") {
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
      }
      if (command === "focus-omnibox") {
        window.dispatchEvent(new CustomEvent("encrypt:focus-omnibox"));
      }
      if (command === "new-tab") {
        get().actions.openTab("encrypt://research", "Research tab");
      }
      if (command === "split-pane") {
        get().actions.toggleSplitPane();
      }
    },
    updateAiDraft: (draft) => set({ aiDraft: draft }),
    updateAiResponse: (aiResponse) => set({ aiResponse }),
    toggleCommandPalette: (open) => set((state) => ({ commandPaletteOpen: open ?? !state.commandPaletteOpen })),
    toggleSplitPane: () => set((state) => ({ activePaneCount: state.activePaneCount === 2 ? 1 : 2 })),
    setActiveTab: (tabId) => set({ activeTabId: tabId }),
  },
}));