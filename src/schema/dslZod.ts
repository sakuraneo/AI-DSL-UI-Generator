import { z } from "zod";
import type { DSLNode } from "./types";

/**
 * 与 `DSLNode` 一致的递归 Zod schema，供解析 AI 返回的 JSON。
 */
export const dslNodeSchema: z.ZodType<DSLNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("text"),
      content: z.string(),
    }),
    z.object({
      type: z.literal("button"),
      label: z.string(),
      action: z.string().optional(),
      href: z.url().optional(),
    }),
    z.object({
      type: z.literal("image"),
      src: z.string().min(1, "需要非空 src"),
      alt: z.string().min(1, "需要非空 alt（无障碍）"),
    }),
    z.object({
      type: z.literal("chart"),
      symbol: z.string().min(1, "需要 symbol，如 BTC"),
    }),
    z.object({
      type: z.literal("input"),
      label: z.string().optional(),
      placeholder: z.string().optional(),
      inputType: z
        .enum(["text", "number", "email", "password"])
        .optional(),
    }),
    z.object({
      type: z.literal("card"),
      children: z.array(dslNodeSchema),
    }),
    z.object({
      type: z.literal("container"),
      direction: z.enum(["row", "column"]).optional(),
      gap: z.number().optional(),
      children: z.array(dslNodeSchema),
    }),
  ])
);

export function formatDslZodError(err: z.ZodError): string {
  return err.issues
    .map((i) => {
      const path = i.path.length ? i.path.join(".") : "根";
      return `${path}: ${i.message}`;
    })
    .join("; ");
}
