import { describe, expect, it } from "vitest";
import { keyValueRowsToRecord, validateKeyValueRows } from "../../src/core/keyValueRows";
import { validateEnvVarRows } from "../../src/components/settings/EnvVarsEditor";

describe("keyValueRows", () => {
  it("converts rows to record", () => {
    const result = keyValueRowsToRecord([
      { key: "NODE_ENV", value: "development" },
      { key: "  ", value: "ignored" },
      { key: "FOO", value: "bar" },
    ]);
    expect(result).toEqual({ NODE_ENV: "development", FOO: "bar" });
  });

  it("rejects empty keys with default message", () => {
    expect(validateKeyValueRows([{ key: "", value: "x" }])).toBe("Keys cannot be empty");
  });

  it("rejects duplicate keys with default message", () => {
    expect(
      validateKeyValueRows([
        { key: "FOO", value: "a" },
        { key: "FOO", value: "b" },
      ]),
    ).toBe("Duplicate key: FOO");
  });
});

describe("validateEnvVarRows", () => {
  it("rejects empty keys", () => {
    expect(validateEnvVarRows([{ key: "", value: "x" }])).toBe(
      "Environment variable keys cannot be empty",
    );
  });

  it("rejects duplicate keys", () => {
    expect(
      validateEnvVarRows([
        { key: "FOO", value: "a" },
        { key: "FOO", value: "b" },
      ]),
    ).toBe("Duplicate environment variable key: FOO");
  });
});
