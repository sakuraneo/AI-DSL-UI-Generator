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

  it("parses card with width and height", () => {
    const tree = parseDSLJSON(
      JSON.stringify({
        type: "card",
        width: 400,
        height: 300,
        children: [{ type: "text", content: "x" }],
      })
    );
    expect(tree).toEqual({
      type: "card",
      width: 400,
      height: 300,
      children: [{ type: "text", content: "x" }],
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

  it("accepts link and divider inside card", () => {
    const tree = parseDSLJSON(
      JSON.stringify({
        type: "card",
        children: [
          { type: "text", content: "标题" },
          { type: "divider" },
          {
            type: "link",
            label: "帮助",
            href: "https://example.com/help",
          },
        ],
      })
    );
    expect(tree.type).toBe("card");
    expect((tree as { children: unknown[] }).children).toHaveLength(3);
    expect((tree as { children: { type: string }[] }).children[1]).toEqual({
      type: "divider",
    });
  });

  it("rejects link with invalid href", () => {
    expect(() =>
      parseDSLJSON(
        JSON.stringify({
          type: "link",
          label: "x",
          href: "not-a-url",
        })
      )
    ).toThrow(/DSL 校验失败/);
  });
});
