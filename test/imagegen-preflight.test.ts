import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT_PATH = join(process.cwd(), "scripts/imagegen-preflight.mjs");

describe("imagegen preflight", () => {
  it("names UI surface jobs when credentials are missing", () => {
    const output = runPreflight("");

    expect(output).toContain("OPENAI_API_KEY=missing");
    expect(output).toContain("fighter references");
    expect(output).toContain("animation rows");
    expect(output).toContain("stage layers");
    expect(output).toContain("UI surface jobs");
  });

  it("names UI surface jobs when credentials are present", () => {
    const output = runPreflight("test-key");

    expect(output).toContain("OPENAI_API_KEY=present");
    expect(output).toContain("fighter references");
    expect(output).toContain("animation rows");
    expect(output).toContain("stage layers");
    expect(output).toContain("UI surface jobs");
  });
});

function runPreflight(openAiKey: string): string {
  return execFileSync(process.execPath, [SCRIPT_PATH], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      OPENAI_API_KEY: openAiKey,
    },
  });
}
