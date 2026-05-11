import { useEffect, useRef } from "react";
import { CandlestickSeries, ColorType, createChart, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import type { PriceBar } from "@encrypt/shared";

export function LightThemeChart({ symbol, bars }: { symbol: string; bars: PriceBar[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#08111f" },
        textColor: "#cbd5e1",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.2)" },
      timeScale: { borderColor: "rgba(148, 163, 184, 0.2)" },
      height: 340,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderUpColor: "#34d399",
      borderDownColor: "#f87171",
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    });

    seriesRef.current = series;
    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current?.clientWidth ?? 800, height: containerRef.current?.clientHeight ?? 340 });
      chart.timeScale().fitContent();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) {
      return;
    }
    seriesRef.current.setData(bars.map((bar) => ({
      time: Math.floor(new Date(bar.ts).getTime() / 1000) as UTCTimestamp,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    })));
  }, [bars]);

  return <div ref={containerRef} className="h-full w-full rounded-2xl border border-white/10 bg-slate-950/80" aria-label={`${symbol} price chart`} />;
}