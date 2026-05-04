import { describe, expect, it } from "vitest";
import { stringifyDsl } from "./dslJsonIo";
import type { DSLNode } from "../schema/types";

describe("stringifyDsl", () => {
  it("formats with indentation", () => {
    const node: DSLNode = {
      type: "text",
      content: "a",
    };
    expect(stringifyDsl(node)).toBe(
      ["{", '  "type": "text",', '  "content": "a"', "}"].join("\n")
    );
  });
});
