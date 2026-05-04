import type { DSLNode } from "./types";

/**
 * 示例 DSL：嵌套 card → container(row) → text + button(action)
 */
export const exampleDSL: DSLNode = {
  type: "card",
  children: [
    { type: "text", content: "BTC/USDT" },
    {
      type: "container",
      direction: "row",
      gap: 12,
      children: [
        { type: "text", content: "Price: 68000" },
        { type: "button", label: "Buy", action: "order.buy" },
      ],
    },
  ],
};
