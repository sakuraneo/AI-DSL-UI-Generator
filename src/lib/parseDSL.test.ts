import { describe, expect, it } from "vitest";
import { parseDSLJSON } from "./parseDSL";

describe("parseDSLJSON", () => {
  it("parses minimal valid card tree", () => {
    const raw = JSON.stringify({
      type: "card",
      children: [{ type: "text", content: "hi" }],
    });
    const tree = parseDSLJSON(raw);
    expect(tree).toEqual({
      type: "card",
      children: [{ type: "text", content: "hi" }],
    });
  });

  it("strips ```json fences", () => {
    const inner = JSON.stringify({ type: "text", content: "x" });
    const wrapped = "```json\n" + inner + "\n```";
    expect(parseDSLJSON(wrapped)).toEqual({
      type: "text",
      content: "x",
    });
  });

  it("rejects unknown discriminator type", () => {
    expect(() => parseDSLJSON('{"type":"unknown"}')).toThrow(/DSL 校验失败/);
  });

  it("rejects image missing alt", () => {
    expect(() =>
      parseDSLJSON(
        JSON.stringify({ type: "image", src: "https://a.com/x.png", alt: "" })
      )
    ).toThrow(/DSL 校验失败/);
  });
});
