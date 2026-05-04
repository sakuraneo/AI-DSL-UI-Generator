import type { DSLNode } from "../schema/types";

export function stringifyDsl(node: DSLNode): string {
  return JSON.stringify(node, null, 2);
}

export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function downloadDslFile(node: DSLNode, filename = "dsl.json"): void {
  const text = stringifyDsl(node);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}
