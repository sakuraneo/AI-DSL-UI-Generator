import type { DSLNode } from "../schema/types";

/**
 * 解析 AI 返回的字符串（可能带 ```json 围栏），校验后得到 DSLNode。
 */
export function parseDSLJSON(raw: string): DSLNode {
  let text = raw.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/m.exec(text);
  if (fence) text = fence[1]!.trim();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("模型返回不是合法 JSON");
  }

  assertDSLNode(data);
  return data;
}

function assertDSLNode(n: unknown): asserts n is DSLNode {
  if (!n || typeof n !== "object" || !("type" in n)) {
    throw new Error("DSL 根节点必须是带 type 字段的对象");
  }

  const type = (n as { type: unknown }).type;

  if (type === "text") {
    const content = (n as { content?: unknown }).content;
    if (typeof content !== "string") {
      throw new Error('type "text" 需要字符串字段 content');
    }
    return;
  }

  if (type === "button") {
    const label = (n as { label?: unknown }).label;
    if (typeof label !== "string") {
      throw new Error('type "button" 需要字符串字段 label');
    }
    const action = (n as { action?: unknown }).action;
    if (action !== undefined && typeof action !== "string") {
      throw new Error('type "button" 的 action 必须是字符串');
    }
    return;
  }

  if (type === "card") {
    const children = (n as { children?: unknown }).children;
    if (!Array.isArray(children)) {
      throw new Error('type "card" 需要数组字段 children');
    }
    for (const c of children) assertDSLNode(c);
    return;
  }

  if (type === "container") {
    const direction = (n as { direction?: unknown }).direction;
    if (
      direction !== undefined &&
      direction !== "row" &&
      direction !== "column"
    ) {
      throw new Error('type "container" 的 direction 只能是 row 或 column');
    }
    const gap = (n as { gap?: unknown }).gap;
    if (gap !== undefined && typeof gap !== "number") {
      throw new Error('type "container" 的 gap 必须是数字');
    }
    const children = (n as { children?: unknown }).children;
    if (!Array.isArray(children)) {
      throw new Error('type "container" 需要数组字段 children');
    }
    for (const c of children) assertDSLNode(c);
    return;
  }

  throw new Error(`不支持的 type: ${String(type)}`);
}
