import type { Headline, ResearchNote, SearchResult, WatchlistItem } from "@encrypt/shared";
import React from "react";

export const HeadlineCard: React.FC<{ article: Headline }> = ({ article }) => (
  <div className="p-4 bg-gray-900 rounded border border-gray-700">
    <h3 className="font-bold">{article.title}</h3>
    <p className="text-sm text-gray-400 mt-2">{article.summary}</p>
  </div>
);

export const NoteCard: React.FC<{ note: ResearchNote }> = ({ note }) => (
  <div className="p-4 bg-gray-900 rounded border border-gray-700">
    <h3 className="font-bold">{note.title}</h3>
    <p className="text-sm text-gray-400 mt-2">{note.body}</p>
  </div>
);

export const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="mt-4 mb-2 flex items-center justify-between">
    <h2 className="text-lg font-bold">{title}</h2>
    {action}
  </div>
);

export const ShellSurface: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-gray-950 rounded border border-gray-800 p-4 ${className ?? ""}`.trim()}>{children}</div>
);

export const SourceCard: React.FC<{ result: SearchResult; onSave: () => void }> = ({ result, onSave }) => (
  <div className="p-3 bg-gray-900 rounded border border-gray-700">
    <span className="text-xs text-gray-400 uppercase">{result.source}</span>
    <div className="font-medium mt-1">{result.title}</div>
    <p className="text-xs text-gray-400 mt-2">{result.summary}</p>
    <button className="mt-3 rounded border border-white/10 px-3 py-1 text-xs text-slate-200" onClick={onSave}>Save</button>
  </div>
);

export const StatCard: React.FC<{ label: string; value: string | number; delta?: string }> = ({ label, value, delta }) => (
  <div className="p-3 bg-gray-900 rounded border border-gray-700 text-center">
    <div className="text-xs text-gray-400 uppercase">{label}</div>
    <div className="text-lg font-bold mt-1">{value}</div>
    {delta ? <div className="mt-1 text-xs text-gray-500">{delta}</div> : null}
  </div>
);

export const TickerChip: React.FC<{ ticker: { symbol: string; price?: number; change?: number } }> = ({ ticker }) => (
  <span className="inline-block px-2 py-1 bg-blue-900 text-blue-100 rounded text-xs font-mono">
    {ticker.symbol}
    {ticker.price != null ? <span className="ml-1 text-green-300">${ticker.price}</span> : null}
    {ticker.change != null ? <span className={ticker.change > 0 ? "text-green-300" : "text-red-300"}>{ticker.change > 0 ? "+" : ""}{ticker.change}%</span> : null}
  </span>
);

export const WatchlistRow: React.FC<{ item: WatchlistItem }> = ({ item }) => (
  <div className="flex justify-between items-center p-3 border-b border-gray-800 hover:bg-gray-900 cursor-pointer">
    <div>
      <div className="font-bold">{item.symbol}</div>
      <div className="text-xs text-gray-400">{item.label}</div>
    </div>
    <div className="text-right">
      <div className="font-bold">{item.price != null ? `$${item.price}` : ""}</div>
      <div className={(item.changePercent ?? 0) > 0 ? "text-green-400" : "text-red-400"}>
        {(item.changePercent ?? 0) > 0 ? "+" : ""}{(item.change ?? 0).toFixed(2)} ({(item.changePercent ?? 0) > 0 ? "+" : ""}{(item.changePercent ?? 0).toFixed(2)}%)
      </div>
    </div>
  </div>
);
