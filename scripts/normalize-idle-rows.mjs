import { execFileSync } from "node:child_process";

const output = execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "idle"], {
  cwd: process.cwd(),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

process.stdout.write(output);
