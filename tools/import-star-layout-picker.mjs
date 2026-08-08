#!/usr/bin/env node

// Convenience wrapper for the "Import Star layout" task button: shows a
// native file picker (zenity, then kdialog — whichever is on $PATH) for
// the JSON exported by ?author=layout, then hands it to importStarLayout,
// reusing the same validation as the plain `import:star-layout` CLI. Falls
// back to a path given on the command line when no picker is available.

import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { relative } from "node:path";
import { importStarLayout } from "./import-star-layout.mjs";

function tryPicker(bin, args) {
  const result = spawnSync(bin, args, { encoding: "utf8" });
  if (result.error) {
    if (result.error.code === "ENOENT") return { available: false };
    throw result.error;
  }
  // zenity/kdialog exit non-zero when the user cancels the dialog.
  return { available: true, path: result.status === 0 ? result.stdout.trim() : null };
}

function pickFile() {
  const downloads = `${homedir()}/Downloads/`;
  const pickers = [
    ["zenity", [
      "--file-selection",
      "--title=Import Star layout JSON",
      "--file-filter=JSON files | *.json",
      `--filename=${downloads}`
    ]],
    ["kdialog", ["--getopenfilename", downloads, "*.json"]]
  ];
  for (const [bin, args] of pickers) {
    const picked = tryPicker(bin, args);
    if (picked.available) return picked.path; // a path, or null if canceled
  }
  return undefined; // no picker found on this system
}

const picked = pickFile();
if (picked === null) {
  console.log("Import canceled.");
  process.exit(0);
}

const input = picked ?? process.argv[2];
if (!input) {
  console.error(
    "No file picker found (zenity/kdialog) and no path given.\n" +
    "Usage: node tools/import-star-layout-picker.mjs <layout.json>"
  );
  process.exitCode = 1;
} else {
  try {
    const result = await importStarLayout(input);
    console.log(`IMPORTED ${result.puzzle.id} -> ${relative(result.repositoryRoot, result.outputPath)}`);
  } catch (error) {
    console.error(`INVALID LAYOUT\n${error.message}`);
    process.exitCode = 1;
  }
}
