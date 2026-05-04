import type { DSLNode } from "./types";

/**
 * 示例 DSL：card → 图文 + 表单占位 + 操作行
 */
export const exampleDSL: DSLNode = {
  type: "card",
  children: [
    { type: "chart", symbol: "BTC" },
    { type: "text", content: "BTC/USDT 现货 · 日线图（嵌入 TradingView）" },
    {
      type: "input",
      label: "委托价格",
      placeholder: "68000.00",
      inputType: "text",
    },
    {
      type: "container",
      direction: "row",
      gap: 12,
      children: [
        { type: "text", content: "Price: 68000" },
        {
          type: "button",
          label: "打开欧易 BTC",
          href: "https://www.okx.com/zh-hans/trade-spot/btc-usdt",
          action: "navigate.official",
        },
      ],
    },
  ],
};
