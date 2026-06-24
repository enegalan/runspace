import { beforeEach, describe, expect, it } from "vitest";
import { getFileExtension, normalizeFileName } from "../../src/core/workspace/fileExtension";
import { useEnvironmentStore } from "../../src/stores/environmentStore";
import { TEST_ENVIRONMENT_CATALOG } from "../fixtures/environmentCatalog";

describe("fileExtension", () => {
  beforeEach(() => {
    useEnvironmentStore.setState({
      environments: [],
      available: TEST_ENVIRONMENT_CATALOG,
      selectedId: null,
      defaultEnvironmentId: null,
      loaded: true,
    });
  });

  it("maps runtime ids to file extensions", () => {
    expect(getFileExtension("nodejs")).toBe("js");
    expect(getFileExtension("laravel")).toBe("php");
    expect(getFileExtension("gcc")).toBe("c");
  });

  it("appends the runtime extension when the name has none", () => {
    expect(normalizeFileName("helper", "laravel")).toBe("helper.php");
    expect(normalizeFileName("utils", "nodejs")).toBe("utils.js");
  });

  it("keeps an explicit extension", () => {
    expect(normalizeFileName("data.json", "nodejs")).toBe("data.json");
  });

  it("appends extension to nested paths without a file extension", () => {
    expect(normalizeFileName("lib/helper", "laravel")).toBe("lib/helper.php");
  });
});
