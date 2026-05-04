import type { DSLNode } from "./types";

/**
 * 示例 DSL：card → 图文 + 表单占位 + 操作行（含可选宽高，预览可拖拽改尺寸）
 */
export const exampleDSL: DSLNode = {
  type: "card",
  width: 360,
  height: 520,
  children: [
    {
      type: "text",
      content: "BTC今日价格走势",
    },
    {
      type: "divider",
    },
    {
      type: "chart",
      symbol: "BTC",
    },
    {
      type: "divider",
    },
    {
      type: "input",
      label: "目标价格",
      placeholder: "输入目标价",
      inputType: "number",
    },
    {
      type: "container",
      direction: "row",
      gap: 10,
      children: [
        {
          type: "text",
          content: "当前价格高于目标价",
        },
        {
          type: "button",
          label: "打开欧易官网",
          href: "https://www.okx.com/zh-hans/price/btc",
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "container",
      direction: "row",
      gap: 10,
      children: [
        {
          type: "text",
          content: "今日最高价: 58000 USD",
        },
        {
          type: "text",
          content: "今日最低价: 52000 USD",
        },
      ],
    },
    {
      type: "divider",
    },
  ],
};
