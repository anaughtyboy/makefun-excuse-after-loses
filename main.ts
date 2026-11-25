// Excuse After It Loses — writes the agent's one-line excuse to the output file.
//
// The excuse is a fixed string. This program checks it against the
// competition's limits (one line, 1-200 characters, no leading or trailing
// whitespace, no control characters), writes it out with no trailing
// newline, and then reads the file back to make sure the bytes on disk are
// exactly the line we meant to submit.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const excuse =
  "I lost. On the bright side, my loss prediction model has now achieved 100% accuracy.";

function checkExcuse(line: string): void {
  if (line.length < 1 || line.length > 200) {
    throw new Error(`excuse must be 1-200 characters, got ${line.length}`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("excuse must be a single line");
  }
  if (line.trim() !== line) {
    throw new Error("excuse must not start or end with whitespace");
  }
  if (/[\u0000-\u001F\u007F]/.test(line)) {
    throw new Error("excuse must not contain control characters");
  }
}

function main(): void {
  checkExcuse(excuse);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, excuse, "utf8");

  const back = readFileSync(outPath);
  const expected = Buffer.from(excuse, "utf8");
  if (!back.equals(expected)) {
    throw new Error("read-back mismatch: file does not hold the excuse");
  }
  if (back.length === 0 || back[back.length - 1] === 0x0a) {
    throw new Error("entry must not end with a newline");
  }

  console.log(`wrote ${excuse.length} characters to ${outPath}`);
}

main();
