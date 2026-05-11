import type { ResearchNote, SearchResult, TabState, WatchlistItem } from "@encrypt/shared";
import { NoteCard, ShellSurface, SourceCard, WatchlistRow } from "@encrypt/ui";

export function BrowserPane({
  tab,
  searchResults,
  notes,
  watchlist,
  onSaveResearch,
}: {
  tab: TabState;
  searchResults: SearchResult[];
  notes: ResearchNote[];
  watchlist: WatchlistItem[];
  onSaveResearch: (id: string) => void;
}) {
  if (tab.url === "encrypt://dashboard") {
    return (
      <ShellSurface className="h-full overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.35em] text-cyan-300/80">Dashboard</div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
            The dashboard tab is optimized for finance research, not consumer browsing. It keeps watchlists, movers, and notes within one compact surface.
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
            Workspace state, bookmarks, and session layout are persisted locally and restored when Encrypt relaunches.
          </div>
        </div>
      </ShellSurface>
    );
  }

  if (tab.url === "encrypt://search") {
    return (
      <ShellSurface className="h-full overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.35em] text-cyan-300/80">Search</div>
        <div className="grid gap-3 p-4">
          {searchResults.slice(0, 4).map((result) => <SourceCard key={result.id} result={result} onSave={() => onSaveResearch(result.id)} />)}
        </div>
      </ShellSurface>
    );
  }

  if (tab.url === "encrypt://research") {
    return (
      <ShellSurface className="h-full overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.35em] text-cyan-300/80">Research Workspace</div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          <div className="grid gap-3">
            {notes.slice(0, 2).map((note) => <NoteCard key={note.id} note={note} />)}
          </div>
          <div className="grid gap-3">
            {watchlist.slice(0, 3).map((item) => <WatchlistRow key={item.id} item={item} />)}
          </div>
        </div>
      </ShellSurface>
    );
  }

  return (
    <webview
      src={tab.url}
      partition={tab.partition}
      allowpopups
      className="h-full min-h-[28rem] w-full rounded-2xl border border-white/10 bg-slate-950/80"
      style={{ minHeight: "28rem" }}
    />
  );
}
