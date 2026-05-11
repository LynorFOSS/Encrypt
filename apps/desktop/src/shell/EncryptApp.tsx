import { useEffect, useMemo, useRef, useState } from "react";
import { LightThemeChart } from "./LightThemeChart";
import { BrowserPane } from "./BrowserPane";
import { useShellStore } from "./store";
import type { PaneCommand } from "./store";
import { demoSearchResults, demoShellState } from "@encrypt/shared";
import { HeadlineCard, NoteCard, SectionHeader, ShellSurface, SourceCard, StatCard, TickerChip, WatchlistRow } from "@encrypt/ui";

type CommandItem = { id: string; label: string; hint: string; action: () => void };

function useHydrateShell() {
  const hydrate = useShellStore((state) => state.actions.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
}

function useShellBridge() {
  const setBrowserAction = useShellStore((state) => state.actions.setBrowserAction);
  const handleShortcut = useShellStore((state) => state.actions.handleShortcut);
  useEffect(() => {
    if (!window.encrypt) {
      return;
    }
    const unlistenShortcut = window.encrypt.onShortcut((command) => handleShortcut(command as PaneCommand));
    const unlistenAction = window.encrypt.onBrowserAction(setBrowserAction);
    return () => {
      unlistenShortcut();
      unlistenAction();
    };
  }, [handleShortcut, setBrowserAction]);
}

export function EncryptApp() {
  useHydrateShell();
  useShellBridge();

  const state = useShellStore();
  const actions = useShellStore((store) => store.actions);
  const omniboxRef = useRef<HTMLInputElement | null>(null);
  const [focusToken, setFocusToken] = useState(0);

  useEffect(() => {
    const listener = () => setFocusToken((value) => value + 1);
    window.addEventListener("encrypt:focus-omnibox", listener);
    return () => window.removeEventListener("encrypt:focus-omnibox", listener);
  }, []);

  useEffect(() => {
    if (focusToken > 0) {
      omniboxRef.current?.focus();
    }
  }, [focusToken]);

  useEffect(() => {
    if (state.hydrated) {
      void actions.persist();
    }
  }, [actions, state]);

  const activeWorkspace = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ?? state.workspaces[0] ?? demoShellState.workspaces[0];
  const activeNotes = state.notes.filter((note) => note.workspaceId === activeWorkspace.id);
  const activeWatchlist = state.watchlist.filter((item) => item.workspaceId === activeWorkspace.id);
  const commands = useMemo<CommandItem[]>(() => [
    { id: "new-tab", label: "New research tab", hint: "Create a blank research tab", action: () => actions.openTab("encrypt://research", "Research tab") },
    { id: "split", label: "Toggle split pane", hint: "Show or hide the right browser pane", action: () => actions.handleShortcut("split-pane") },
    { id: "palette", label: "Open command palette", hint: "Run a high-level action", action: () => actions.toggleCommandPalette(true) },
    {
      id: "bookmark",
      label: "Save current page",
      hint: "Persist the current source to the workspace",
      action: () => {
        const firstNote = state.notes[0];
        actions.saveResearchNote({
          id: `note-${Date.now()}`,
          workspaceId: activeWorkspace.id,
          title: firstNote?.title ?? "Untitled note",
          body: firstNote?.body ?? "",
          tags: ["saved"],
          sourceIds: firstNote?.sourceIds ?? [],
          updatedAt: new Date().toISOString(),
        });
      },
    },
  ], [actions, activeWorkspace.id, state.notes]);

  const allResults = state.searchResults.length ? state.searchResults : demoSearchResults;

  return (
    <div className="flex h-screen flex-col overflow-hidden text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src="/brand-mark.svg" alt="Encrypt logo" className="h-9 w-9 rounded-full border border-white/10 bg-white/5 shadow-glow" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-300/80">Encrypt</div>
            <div className="text-xs text-slate-500">Finance-first research terminal</div>
          </div>
          <div className="ml-4 flex flex-wrap gap-2">
            {state.workspaces.map((workspace) => (
              <button key={workspace.id} className={`rounded-full border px-3 py-1 text-xs ${workspace.id === activeWorkspace.id ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300"}`} onClick={() => actions.setActiveWorkspace(workspace.id)}>
                {workspace.name}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input
              ref={omniboxRef}
              defaultValue={state.activeSearchQuery}
              onChange={(event) => void actions.setSearchQuery(event.target.value)}
              placeholder="Search NVDA earnings, BTC whale activity, TSLA insider selling..."
              className="w-[32rem] max-w-[44vw] rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
            />
            <button className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100" onClick={() => actions.toggleCommandPalette(true)}>
              Command
            </button>
          </div>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-[300px_minmax(0,1fr)_360px] gap-4 overflow-hidden p-4 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
        <aside className="encrypt-scrollbar flex min-w-0 flex-col gap-4 overflow-y-auto pr-1">
          <ShellSurface>
            <SectionHeader title="Markets" />
            <div className="space-y-2 p-4">
              {state.tickers.map((ticker) => <TickerChip key={ticker.symbol} ticker={ticker} />)}
            </div>
          </ShellSurface>

          <ShellSurface>
            <SectionHeader title="Watchlist" />
            <div className="space-y-2 p-4">
              {activeWatchlist.map((item) => <WatchlistRow key={item.id} item={item} />)}
            </div>
          </ShellSurface>

          <ShellSurface>
            <SectionHeader title="Bookmarks" />
            <div className="space-y-2 p-4 text-sm text-slate-300">
              {state.bookmarks.map((bookmark) => (
                <button key={bookmark.id} className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-left hover:border-cyan-400/40" onClick={() => actions.openTab(bookmark.url, bookmark.title)}>
                  <div className="font-medium text-white">{bookmark.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{bookmark.symbols.join(", ")}</div>
                </button>
              ))}
            </div>
          </ShellSurface>

          <ShellSurface>
            <SectionHeader title="Recent research" />
            <div className="space-y-2 p-4">
              {activeNotes.map((note) => <NoteCard key={note.id} note={note} />)}
            </div>
          </ShellSurface>
        </aside>

        <section className="encrypt-scrollbar flex min-w-0 flex-col gap-4 overflow-y-auto">
          <ShellSurface className="overflow-hidden">
            <SectionHeader title="Browser tabs" action={<span className="text-xs text-slate-400">{state.activeTabIds.length === 2 ? "Split view" : "Single view"}</span>} />
            <div className="border-b border-white/10 px-4 py-2">
              <div className="flex flex-wrap gap-2">
                {state.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`rounded-full border px-3 py-1 text-xs ${tab.id === state.activeTabId ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300"}`}
                    onClick={() => actions.setActiveTab(tab.id)}
                  >
                    {tab.title}
                  </button>
                ))}
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300" onClick={() => actions.openTab("encrypt://research", "Research tab")}>+</button>
              </div>
            </div>
            <div className={`grid gap-4 p-4 ${state.activePaneCount === 2 ? "xl:grid-cols-2" : "grid-cols-1"}`}>
              <BrowserPane
                tab={state.tabs.find((tab) => tab.id === state.activeTabIds[0]) ?? state.tabs[0]}
                searchResults={state.searchResults.length ? state.searchResults : demoSearchResults}
                notes={activeNotes}
                watchlist={activeWatchlist}
                onSaveResearch={(id) => actions.setBrowserAction({ action: "save-research", url: id, title: "Saved source" })}
              />
              {state.activePaneCount === 2 ? (
                <BrowserPane
                  tab={state.tabs.find((tab) => tab.id === state.activeTabIds[1]) ?? state.tabs[1] ?? state.tabs[0]}
                  searchResults={state.searchResults.length ? state.searchResults : demoSearchResults}
                  notes={activeNotes}
                  watchlist={activeWatchlist}
                  onSaveResearch={(id) => actions.setBrowserAction({ action: "save-research", url: id, title: "Saved source" })}
                />
              ) : null}
            </div>
          </ShellSurface>

          <ShellSurface>
            <div className="grid gap-3 border-b border-white/10 px-4 py-4 md:grid-cols-4">
              <StatCard label="Watchlist" value={String(activeWatchlist.length)} delta="Pinned to the active workspace" />
              <StatCard label="News flow" value={String(state.headlines.length)} delta="Latest finance headlines ingested" />
              <StatCard label="Search hits" value={String(allResults.length)} delta="Ticker, semantic, and faceted results" />
              <StatCard label="AI mode" value="Local" delta="TinyLlama via Ollama" />
            </div>
            <div className="grid gap-4 p-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <ShellSurface className="overflow-hidden">
                  <SectionHeader title="Price action" action={<span className="text-xs text-slate-400">{state.selectedTicker ?? activeWorkspace.activeTicker}</span>} />
                  <div className="h-[360px] p-3">
                    <LightThemeChart symbol={state.selectedTicker ?? activeWorkspace.activeTicker ?? "NVDA"} bars={state.chartSeries} />
                  </div>
                </ShellSurface>

                <ShellSurface>
                  <SectionHeader title="Search results" action={<span className="text-xs text-slate-400">Source filtered</span>} />
                  <div className="grid gap-3 p-4">
                    {allResults.map((result) => <SourceCard key={result.id} result={result} onSave={() => actions.setBrowserAction({ action: "save-research", url: result.sourceUrl, title: result.title })} />)}
                  </div>
                </ShellSurface>
              </div>

              <div className="space-y-4">
                <ShellSurface>
                  <SectionHeader title="Latest headlines" />
                  <div className="grid gap-2 p-4">
                    {state.headlines.map((article) => <HeadlineCard key={article.id} article={article} />)}
                  </div>
                </ShellSurface>

                <ShellSurface>
                  <SectionHeader title="Market intel" />
                  <div className="grid gap-2 p-4 text-sm text-slate-300">
                    {state.filings.slice(0, 2).map((filing) => <div key={filing.id} className="rounded-xl border border-white/10 bg-slate-900/80 p-3"><div className="font-medium text-white">{filing.title}</div><div className="mt-1 text-xs text-slate-400">{filing.formType} • {filing.ticker} • {new Date(filing.publishedAt).toLocaleDateString()}</div></div>)}
                    {state.transcripts.slice(0, 2).map((transcript) => <div key={transcript.id} className="rounded-xl border border-white/10 bg-slate-900/80 p-3"><div className="font-medium text-white">{transcript.title}</div><div className="mt-1 text-xs text-slate-400">{transcript.quarter} • {transcript.ticker}</div></div>)}
                  </div>
                </ShellSurface>
              </div>
            </div>
          </ShellSurface>

          <ShellSurface>
            <SectionHeader title="Research workspace" action={<span className="text-xs text-slate-400">Session persists locally</span>} />
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <textarea
                value={state.aiDraft}
                onChange={(event) => actions.updateAiDraft(event.target.value)}
                className="min-h-[220px] rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Write a research note, hypothesis, or diligence checklist..."
              />
              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">AI summary card</div>
                  <div className="mt-3 text-sm leading-6 text-slate-300">
                    {state.aiResponse?.answer ?? "Ask Encrypt to summarize a page, explain a filing, compare companies, or generate concise research notes with citations."}
                  </div>
                  {state.aiResponse?.citations.length ? <div className="mt-3 flex flex-wrap gap-2">{state.aiResponse.citations.map((citation) => <span key={citation} className="rounded-full border border-cyan-400/20 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-cyan-200">{citation}</span>)}</div> : null}
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-400">
                  Research context, watchlists, and saved sources persist to the local shell store and can be restored on restart.
                </div>
              </div>
            </div>
          </ShellSurface>
        </section>

        <aside className="encrypt-scrollbar flex min-w-0 flex-col gap-4 overflow-y-auto pl-1">
          <ShellSurface>
            <SectionHeader title="Local AI" />
            <div className="space-y-3 p-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                TinyLlama runs locally through Ollama. The assistant can summarize a page, explain a filing, compare companies, or answer finance questions.
              </div>
              <div className="grid gap-2">
                {commands.map((command) => <button key={command.id} onClick={command.action} className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-3 text-left text-sm text-slate-100 hover:border-cyan-400/40 hover:bg-slate-900"><div className="font-medium">{command.label}</div><div className="text-xs text-slate-400">{command.hint}</div></button>)}
              </div>
            </div>
          </ShellSurface>

          <ShellSurface>
            <SectionHeader title="Activity" />
            <div className="space-y-2 p-4 text-sm text-slate-300">
              {state.recentActivities.map((item) => <div key={item} className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2">{item}</div>)}
            </div>
          </ShellSurface>

          <ShellSurface>
            <SectionHeader title="Queries" />
            <div className="space-y-2 p-4 text-sm text-slate-300">
              {state.recentQueries.map((query) => <button key={query} onClick={() => void actions.setSearchQuery(query)} className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-left hover:border-cyan-400/40">{query}</button>)}
            </div>
          </ShellSurface>
        </aside>
      </main>

      {state.commandPaletteOpen ? <CommandPalette onClose={() => actions.toggleCommandPalette(false)} /> : null}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const actions = useShellStore((state) => state.actions);
  const [query, setQuery] = useState("");
  const items = useMemo(() => [
    { label: "Explain this page", hint: "Run the browser assistant on the current source", run: () => actions.setBrowserAction({ action: "explain", url: "encrypt://active", title: "Active page" }) },
    { label: "Summarize article", hint: "Create a concise source summary", run: () => actions.setBrowserAction({ action: "summarize", url: "encrypt://active", title: "Active page" }) },
    { label: "Compare companies", hint: "Generate a valuation note", run: () => actions.setBrowserAction({ action: "compare", url: "encrypt://active", title: "Active page" }) },
    { label: "Create watchlist item", hint: "Persist a ticker to the active workspace", run: () => actions.addWatchlistItem("NVDA", "NVIDIA") },
  ], [actions]);
  const filtered = items.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
      <div className="mx-auto mt-[12vh] w-[640px] max-w-[92vw] rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
        <div className="border-b border-white/10 p-4">
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") onClose(); }} placeholder="Type a command or finance action..." className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <div className="max-h-[420px] overflow-auto p-2">
          {filtered.map((item) => <button key={item.label} onClick={() => { item.run(); onClose(); }} className="flex w-full flex-col rounded-2xl px-4 py-3 text-left hover:bg-white/5"><div className="text-sm font-medium text-white">{item.label}</div><div className="text-xs text-slate-400">{item.hint}</div></button>)}
        </div>
      </div>
    </div>
  );
}