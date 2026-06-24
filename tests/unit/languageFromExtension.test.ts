import { beforeEach, describe, expect, it } from "vitest";
import { languageFromExtension } from "../../src/core/languageFromExtension";
import { useEnvironmentStore } from "../../src/stores/environmentStore";
import { TEST_ENVIRONMENT_CATALOG } from "../fixtures/environmentCatalog";

describe("languageFromExtension", () => {
  beforeEach(() => {
    useEnvironmentStore.setState({
      environments: [],
      available: TEST_ENVIRONMENT_CATALOG,
      selectedId: null,
      defaultEnvironmentId: null,
      loaded: true,
    });
  });

  it("maps runtime file extensions from environment definitions", () => {
    expect(languageFromExtension("main.js")).toBe("javascript");
    expect(languageFromExtension("index.php")).toBe("php");
    expect(languageFromExtension("main.c")).toBe("c");
  });

  it("falls back to auxiliary extension mappings", () => {
    expect(languageFromExtension("data.json")).toBe("json");
    expect(languageFromExtension("notes.md")).toBe("markdown");
  });

  it("returns plaintext when no mapping matches", () => {
    expect(languageFromExtension("readme")).toBe("plaintext");
    expect(languageFromExtension("archive.xyz")).toBe("plaintext");
  });
});
