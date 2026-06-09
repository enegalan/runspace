import { describe, expect, it } from "vitest";
import {
  rowsToEnvVars,
  validateEnvVarRows,
} from "../../src/components/settings/EnvVarsEditor";

describe("EnvVarsEditor helpers", () => {
  it("converts rows to env vars map", () => {
    const result = rowsToEnvVars([
      { key: "NODE_ENV", value: "development" },
      { key: "  ", value: "ignored" },
      { key: "FOO", value: "bar" },
    ]);
    expect(result).toEqual({ NODE_ENV: "development", FOO: "bar" });
  });

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
