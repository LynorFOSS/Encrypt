import { describe, expect, it } from "vitest";
import { demoSearchResults, demoTickers } from "../../packages/shared/src/sampleData";

describe("shared finance sample data", () => {
  it("includes pinned research tickers", () => {
    expect(demoTickers.some((ticker) => ticker.symbol === "NVDA" && ticker.pinned)).toBe(true);
    expect(demoTickers.some((ticker) => ticker.symbol === "BTC")).toBe(true);
  });

  it("includes compare-style search results", () => {
    expect(demoSearchResults.some((result) => result.title.includes("MSFT vs AAPL"))).toBe(true);
  });
});
