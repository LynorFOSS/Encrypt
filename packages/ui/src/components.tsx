import React from "react";

export const HeadlineCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-4 bg-gray-900 rounded border border-gray-700">
    <h3 className="font-bold">{title}</h3>
    {children}
  </div>
);

export const NoteCard: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="p-4 bg-gray-900 rounded border border-gray-700">
    <h3 className="font-bold">{title}</h3>
    <p className="text-sm text-gray-400 mt-2">{content}</p>
  </div>
);

export const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-lg font-bold mt-4 mb-2">{title}</h2>
);

export const ShellSurface: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-gray-950 rounded border border-gray-800 p-4">{children}</div>
);

export const SourceCard: React.FC<{ source: string; children: React.ReactNode }> = ({ source, children }) => (
  <div className="p-3 bg-gray-900 rounded border border-gray-700">
    <span className="text-xs text-gray-400 uppercase">{source}</span>
    {children}
  </div>
);

export const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="p-3 bg-gray-900 rounded border border-gray-700 text-center">
    <div className="text-xs text-gray-400 uppercase">{label}</div>
    <div className="text-lg font-bold mt-1">{value}</div>
  </div>
);

export const TickerChip: React.FC<{ symbol: string; price?: number; change?: number }> = ({
  symbol,
  price,
  change,
}) => (
  <span className="inline-block px-2 py-1 bg-blue-900 text-blue-100 rounded text-xs font-mono">
    {symbol}
    {price && <span className="ml-1 text-green-300">${price}</span>}
    {change && <span className={change > 0 ? "text-green-300" : "text-red-300"}>{change > 0 ? "+" : ""}{change}%</span>}
  </span>
);

export const WatchlistRow: React.FC<{
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}> = ({ symbol, name, price, change, changePercent }) => (
  <div className="flex justify-between items-center p-3 border-b border-gray-800 hover:bg-gray-900 cursor-pointer">
    <div>
      <div className="font-bold">{symbol}</div>
      <div className="text-xs text-gray-400">{name}</div>
    </div>
    <div className="text-right">
      <div className="font-bold">${price}</div>
      <div className={changePercent > 0 ? "text-green-400" : "text-red-400"}>
        {changePercent > 0 ? "+" : ""}{change.toFixed(2)} ({changePercent > 0 ? "+" : ""}{changePercent.toFixed(2)}%)
      </div>
    </div>
  </div>
);
