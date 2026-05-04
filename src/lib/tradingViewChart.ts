/**
 * TradingView 嵌入式-widget（公开页面），用于展示现货 USDT 日线图。
 * 无需自有 API Key；依赖 TradingView 在线服务。
 */

/** 主流币种简称 → TradingView symbol（BINANCE 现货 USDT） */
const SYMBOL_MAP: Record<string, string> = {
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  SOL: "BINANCE:SOLUSDT",
  BNB: "BINANCE:BNBUSDT",
  XRP: "BINANCE:XRPUSDT",
  DOGE: "BINANCE:DOGEUSDT",
  ADA: "BINANCE:ADAUSDT",
  AVAX: "BINANCE:AVAXUSDT",
  DOT: "BINANCE:DOTUSDT",
};

/**
 * @param input 如 `BTC`、`ETH`，或已是 `BINANCE:BTCUSDT` 形式
 */
export function resolveTradingViewSymbol(input: string): string {
  const t = input.trim();
  if (t.includes(":")) return t;
  const k = t.toUpperCase();
  if (SYMBOL_MAP[k]) return SYMBOL_MAP[k];
  return `BINANCE:${k}USDT`;
}

export type TradingViewChartTheme = "light" | "dark";

/** 与页面 CSS（prefers-color-scheme）一致的主题 */
export function resolveTradingViewTheme(): TradingViewChartTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** 日线图嵌入 URL（当日走势即日线周期） */
export function tradingViewDailyChartEmbedUrl(
  tvSymbol: string,
  theme: TradingViewChartTheme = "light"
): string {
  const params = new URLSearchParams({
    symbol: tvSymbol,
    interval: "D",
    theme,
    locale: "zh_CN",
    hide_side_toolbar: "1",
    allow_symbol_change: "false",
    save_image: "false",
    calendar: "false",
  });
  return `https://www.tradingview.com/widgetembed/?${params.toString()}`;
}
