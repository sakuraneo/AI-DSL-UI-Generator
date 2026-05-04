import { describe, expect, it, vi, afterEach } from "vitest";
import { getEffectiveScheme } from "./themePreference";

describe("getEffectiveScheme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns light or dark when preference is fixed", () => {
    expect(getEffectiveScheme("light")).toBe("light");
    expect(getEffectiveScheme("dark")).toBe("dark");
  });

  it("for system, follows matchMedia", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    });
    expect(getEffectiveScheme("system")).toBe("dark");

    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });
    expect(getEffectiveScheme("system")).toBe("light");
  });
});
