import type { DSLNode } from "./types";

/**
 * 示例 DSL：card → 图文 + 表单占位 + 操作行
 */
export const exampleDSL: DSLNode = {
  type: "card",
  children: [
    {
      type: "image",
      src: "https://picsum.photos/seed/dsl-demo/320/160",
      alt: "示例配图",
    },
    { type: "text", content: "BTC/USDT" },
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
        { type: "button", label: "Buy", action: "order.buy" },
      ],
    },
  ],
};
