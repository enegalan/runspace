import { describe, expect, it } from "vitest";
import { getFileExtension, normalizeFileName } from "../../src/core/workspace/fileExtension";

describe("fileExtension", () => {
  it("maps runtime ids to file extensions", () => {
    expect(getFileExtension("nodejs")).toBe("js");
    expect(getFileExtension("php")).toBe("php");
    expect(getFileExtension("python")).toBe("py");
    expect(getFileExtension("laravel")).toBe("php");
    expect(getFileExtension("gcc")).toBe("c");
    expect(getFileExtension("gpp")).toBe("cpp");
  });

  it("appends the runtime extension when the name has none", () => {
    expect(normalizeFileName("helper", "php")).toBe("helper.php");
    expect(normalizeFileName("utils", "nodejs")).toBe("utils.js");
  });

  it("keeps an explicit extension", () => {
    expect(normalizeFileName("data.json", "nodejs")).toBe("data.json");
  });

  it("appends extension to nested paths without a file extension", () => {
    expect(normalizeFileName("lib/helper", "php")).toBe("lib/helper.php");
  });
});
