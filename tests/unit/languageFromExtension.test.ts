import { describe, expect, it } from "vitest";
import { languageFromExtension } from "../../src/core/languageFromExtension";

describe("languageFromExtension", () => {
  it("maps common file extensions", () => {
    expect(languageFromExtension("main.js")).toBe("javascript");
    expect(languageFromExtension("index.php")).toBe("php");
    expect(languageFromExtension("main.c")).toBe("c");
    expect(languageFromExtension("data.json")).toBe("json");
    expect(languageFromExtension("notes.md")).toBe("markdown");
    expect(languageFromExtension("app.ts")).toBe("typescript");
    expect(languageFromExtension("component.tsx")).toBe("typescript");
    expect(languageFromExtension("module.mjs")).toBe("javascript");
    expect(languageFromExtension("legacy.cjs")).toBe("javascript");
    expect(languageFromExtension("main.cc")).toBe("cpp");
    expect(languageFromExtension("header.h")).toBe("c");
    expect(languageFromExtension("page.html")).toBe("html");
    expect(languageFromExtension("style.css")).toBe("css");
  });

  it("returns plaintext when no mapping matches", () => {
    expect(languageFromExtension("readme")).toBe("plaintext");
    expect(languageFromExtension("archive.xyz")).toBe("plaintext");
  });
});
