import { dslNodeSchema, formatDslZodError } from "../schema/dslZod";
import type { DSLNode } from "../schema/types";

/**
 * 解析 AI 返回的字符串（可能带 ```json 围栏），经 Zod 校验后得到 DSLNode。
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

  const result = dslNodeSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`DSL 校验失败：${formatDslZodError(result.error)}`);
  }
  return result.data;
}
