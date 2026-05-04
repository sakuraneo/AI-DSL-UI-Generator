import type { DSLNode } from "../schema/types";
import { parseDSLJSON } from "./parseDSL";

const SYSTEM_PROMPT = `你是一个 UI DSL 生成器，只输出一个合法的 JSON 对象，不要其它解释文字。

顶层必须是一个节点对象，结构如下（discriminated union，由 type 区分）：

1) { "type": "text", "content": string }
2) { "type": "button", "label": string, "action"?: string, "href"?: string }
   — 若有 "href" 且为 https URL，按钮在新标签打开官网；可与 action 同时存在。
3) { "type": "image", "src": string, "alt": string }
4) { "type": "chart", "symbol": string }
   — symbol 用 BTC、ETH、SOL 等简称，预览中为日线图（TradingView 嵌入）。
5) { "type": "input", "label"?: string, "placeholder"?: string, "inputType"?: "text"|"number"|"email"|"password" }
6) { "type": "card", "children": DSLNode[] }
7) { "type": "container", "direction"?: "row"|"column", "gap"?: number, "children": DSLNode[] }

常用模式：用 card 包一层；加密货币场景可用 chart(BTC) + 文案 + 带 href 的按钮跳转交易所官网。

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
