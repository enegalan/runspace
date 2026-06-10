import { describe, expect, it } from "vitest";
import {
  getRuntimeFileExtension,
  normalizeFileName,
} from "../../src/core/workspace/fileExtension";

describe("fileExtension", () => {
  it("maps runtime ids to file extensions", () => {
    expect(getRuntimeFileExtension("nodejs")).toBe("js");
    expect(getRuntimeFileExtension("php")).toBe("php");
    expect(getRuntimeFileExtension("python")).toBe("py");
    expect(getRuntimeFileExtension("laravel")).toBe("php");
    expect(getRuntimeFileExtension("gcc")).toBe("c");
    expect(getRuntimeFileExtension("gpp")).toBe("cpp");
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
