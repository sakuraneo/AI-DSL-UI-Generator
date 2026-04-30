import type { DSLNode } from "./types";

// 示例 DSL 结构
export const exampleDSL: DSLNode = {
  type: "card",
  children: [
    { type: "text", content: "BTC/USDT" },
    { type: "text", content: "Price: 68000" },
    { type: "button", label: "Buy" }
  ]
};