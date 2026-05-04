import type { DSLNode } from "../schema/types";
import { parseDSLJSON } from "./parseDSL";

const SYSTEM_PROMPT = `你是一个 UI DSL 生成器，只输出一个合法的 JSON 对象，不要其它解释文字。

顶层必须是一个节点对象，结构如下（discriminated union，由 type 区分）：

1) { "type": "text", "content": string }
2) { "type": "button", "label": string, "action"?: string, "href"?: string }
   — 若有 "href" 且为 https URL，按钮在新标签打开官网；可与 action 同时存在。
3) { "type": "link", "label": string, "href": string }
   — 行内文字链接（http(s) URL），新标签打开；与 button 区分用于次要跳转。
4) { "type": "divider" } — 水平分隔线，无其它字段。
5) { "type": "image", "src": string, "alt": string }
6) { "type": "chart", "symbol": string }
   — symbol 用 BTC、ETH、SOL 等简称，预览中为日线图（TradingView 嵌入）。
7) { "type": "input", "label"?: string, "placeholder"?: string, "inputType"?: "text"|"number"|"email"|"password" }
8) { "type": "card", "width"?: number, "height"?: number, "children": DSLNode[] }
   — width/height 为预览卡片像素尺寸（80–4096），可省略；预览中可拖拽右下角调整并写回。
9) { "type": "container", "direction"?: "row"|"column", "gap"?: number, "children": DSLNode[] }

常用模式：card 内组合 text / divider / link / chart / button；divider 用于区块分隔。

务必保证 JSON 可被解析，字符串使用双引号，不要有尾随逗号。`;

export async function generateDSLFromPrompt(userPrompt: string): Promise<DSLNode> {
  const model =
    import.meta.env.VITE_DEEPSEEK_MODEL?.trim() || "deepseek-chat";

  const res = await fetch("/api/deepseek/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`请求失败 ${res.status}: ${body.slice(0, 500)}`);
  }

  const data: unknown = await res.json();
  const content = extractMessageContent(data);
  return parseDSLJSON(content);
}

function extractMessageContent(data: unknown): string {
  if (!data || typeof data !== "object") {
    throw new Error("响应格式异常");
  }
  const choices = (data as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0]) {
    throw new Error("响应中没有 choices");
  }
  const msg = (choices[0] as { message?: { content?: unknown } }).message;
  const text = msg?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("模型未返回文本内容");
  }
  return text;
}
