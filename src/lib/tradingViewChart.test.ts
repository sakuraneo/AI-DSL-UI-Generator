import { describe, expect, it } from "vitest";
import {
  resolveTradingViewSymbol,
  tradingViewDailyChartEmbedUrl,
} from "./tradingViewChart";

describe("resolveTradingViewSymbol", () => {
  it("maps BTC", () => {
    expect(resolveTradingViewSymbol("btc")).toBe("BINANCE:BTCUSDT");
  });

  it("passes through TV symbol", () => {
    expect(resolveTradingViewSymbol("BINANCE:ETHUSDT")).toBe(
      "BINANCE:ETHUSDT"
    );
  });
});

describe("tradingViewDailyChartEmbedUrl", () => {
  it("includes symbol query", () => {
    const u = tradingViewDailyChartEmbedUrl("BINANCE:BTCUSDT", "light");
    expect(u).toContain("tradingview.com/widgetembed");
    expect(u).toContain("BINANCE%3ABTCUSDT");
    expect(u).toContain("theme=light");
  });

  it("passes dark theme", () => {
    const u = tradingViewDailyChartEmbedUrl("BINANCE:BTCUSDT", "dark");
    expect(u).toContain("theme=dark");
  });
});
