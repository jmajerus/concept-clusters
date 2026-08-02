import { spawnSync } from "node:child_process";
import {
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CATALOGUES } from "../catalogues/index.js";
import {
  catalogueBundleToJsonLd,
  catalogueFromJsonLd,
  catalogueToJsonLd
} from "../modules/catalogueJsonLd.js";
import {
  validateCatalogueContent,
  validatePuzzleContent
} from "../modules/contentValidation.js";
import {
  JSON_LD_TYPES,
  validateJsonLdProfile
} from "../modules/jsonLdProfile.js";
import { definePuzzle, resolvePuzzleResourceUrl } from "../modules/puzzleManifest.js";
import { puzzleFromJsonLd, puzzleToJsonLd } from "../modules/puzzleJsonLd.js";
import { validateLearningIntroduction } from "../modules/learningIntroductionValidation.js";
import { CATEGORIES, slugify } from "../puzzles/categories.js";
import { PUZZLES } from "../puzzles/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;

function usage(message = "") {
  if (message) console.error(`${message}\n`);
  console.error(`Usage:
  npm run content:export -- <puzzle-id> [--output <file|->]
  npm run content:export -- --catalogue <id> [--manifest] [--output <file|->]
  npm run content:check -- <file> [more files...]
  npm run content:import -- <puzzle.ccpuzzle.jsonld> [--replace]
                            [--catalogue <id>] [--reason <text>] [--dry-run]`);
  process.exit(message ? 1 : 0);
}

function parseArgs(raw) {
  const values = { files: [] };
  for (let index = 0; index < raw.length; index++) {
    const arg = raw[index];
    if (["--replace", "--manifest", "--dry-run"].includes(arg)) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      values[key] = true;
    } else if (["--output", "--catalogue", "--reason"].includes(arg)) {
      const value = raw[++index];
      if (!value) usage(`${arg} requires a value.`);
      values[arg.slice(2)] = value;
    } else if (arg === "--help" || arg === "-h") {
      usage();
    } else if (arg.startsWith("-")) {
      usage(`Unknown option: ${arg}`);
    } else {
      values.files.push(arg);
    }
  }
  return values;
}

function pretty(document) {
  return `${JSON.stringify(document, null, 2)}\n`;
}

async function writeOutput(document, output, fallbackName) {
  const text = pretty(document);
  if (output === "-") {
    process.stdout.write(text);
    return;
  }
  const target = resolve(output || fallbackName);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text, "utf8");
  const relativeTarget = relative(root, target);
  console.log(`Wrote ${relativeTarget.startsWith("..") ? target : relativeTarget}`);
}

async function learningContentFor(puzzle) {
  const content = puzzle.learningIntroduction?.content;
  if (!content?.src) return null;
  const url = resolvePuzzleResourceUrl(puzzle, content.src);
  if (url.protocol !== "file:") return null;
  return readFile(fileURLToPath(url), "utf8");
}

async function exportCommand(args) {
  if (args.catalogue) {
    const catalogue = CATALOGUES.find(item => item.id === args.catalogue);
    if (!catalogue) usage(`Unknown catalogue: ${args.catalogue}`);
    const document = args.manifest
      ? catalogueToJsonLd(catalogue)
      : catalogueBundleToJsonLd(catalogue, PUZZLES, {
        categories: CATEGORIES,
        puzzleOptions: new Map(await Promise.all(catalogue.entries.map(async entry => {
          const puzzle = PUZZLES.find(item => item.id === entry.id);
          return [entry.id, { learningContent: await learningContentFor(puzzle) }];
        })))
      });
    const suffix = args.manifest ? "cccatalogue.jsonld" : "ccbundle.jsonld";
    return writeOutput(document, args.output, `${catalogue.id}.${suffix}`);
  }
  if (args.files.length !== 1) usage("Export requires one puzzle id.");
  const puzzle = PUZZLES.find(item => item.id === args.files[0]);
  if (!puzzle) usage(`Unknown puzzle: ${args.files[0]}`);
  const document = puzzleToJsonLd(puzzle, {
    learningContent: await learningContentFor(puzzle)
  });
  return writeOutput(document, args.output, `${puzzle.id}.ccpuzzle.jsonld`);
}

async function readDocument(filename) {
  const path = resolve(filename);
  const bytes = await readFile(path);
  if (bytes.byteLength > MAX_DOCUMENT_BYTES) {
    throw new Error(`${filename}: document exceeds ${MAX_DOCUMENT_BYTES} bytes`);
  }
  try {
    return { path, document: JSON.parse(bytes.toString("utf8")) };
  } catch (error) {
    throw new Error(`${filename}: invalid JSON (${error.message})`);
  }
}

async function validateDocument(document, path) {
  const errors = validateJsonLdProfile(document);
  if (errors.length) return errors;
  try {
    if (document["@type"] === JSON_LD_TYPES.puzzle) {
      const puzzle = definePuzzle(pathToFileURL(path), puzzleFromJsonLd(document));
      errors.push(...validatePuzzleContent(puzzle));
      errors.push(...await validateLearningIntroduction(puzzle));
    } else {
      const imported = catalogueFromJsonLd(document);
      const ids = new Set(imported.puzzles.map(puzzle => puzzle.id));
      errors.push(...validateCatalogueContent(
        imported.catalogue,
        imported.puzzles.length ? { puzzleIds: ids } : {}
      ));
      for (const puzzle of imported.puzzles) {
        definePuzzle(pathToFileURL(path), puzzle);
        errors.push(...validatePuzzleContent(puzzle));
        errors.push(...await validateLearningIntroduction(puzzle));
      }
    }
  } catch (error) {
    errors.push(error.message);
  }
  return errors;
}

async function checkCommand(args) {
  if (!args.files.length) usage("Check requires at least one JSON-LD file.");
  let failed = false;
  for (const filename of args.files) {
    try {
      const { path, document } = await readDocument(filename);
      const errors = await validateDocument(document, path);
      if (errors.length) {
        failed = true;
        console.error(`${filename}:\n- ${errors.join("\n- ")}`);
      } else {
        console.log(`Valid: ${filename}`);
      }
    } catch (error) {
      failed = true;
      console.error(error.message);
    }
  }
  if (failed) process.exitCode = 1;
}

async function materializeImportedLearning(document, inputPath) {
  const content = document.learningIntroduction?.content;
  if (!content?.src) return document;
  if (/^[a-z][a-z\d+.-]*:/i.test(content.src) || content.src.startsWith("//")) {
    throw new Error("learningIntroduction.content.src must be a local relative path");
  }
  const base = `${dirname(inputPath)}${sep}`;
  const source = resolve(dirname(inputPath), content.src);
  if (!source.startsWith(base)) throw new Error("learningIntroduction.content.src cannot escape the import package");
  const markdown = await readFile(source, "utf8");
  return {
    ...document,
    learningIntroduction: {
      ...document.learningIntroduction,
      content: { text: markdown, mediaType: "text/markdown" }
    }
  };
}

async function walkPuzzleModules(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "layouts") paths.push(...await walkPuzzleModules(path));
    } else if (entry.name.endsWith(".js") &&
        !["index.js", "categories.js", "showcase.js"].includes(entry.name)) {
      paths.push(path);
    }
  }
  return paths;
}

async function existingPuzzleModule(id) {
  for (const path of await walkPuzzleModules(join(root, "puzzles"))) {
    // Searching source text for `id: ...` is unsafe: related-puzzle entries
    // use the same key and can make an adjacent module look like the puzzle
    // being replaced. Inspect the module's actual default manifest instead.
    const candidate = (await import(pathToFileURL(path).href)).default;
    if (candidate?.id === id) return path;
  }
  return null;
}

function variableName(id) {
  const words = id.split("-");
  return words[0] + words.slice(1).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join("");
}

function generatedModule(puzzle, canonicalRelativePath, modulePath) {
  let manifestImport = relative(
    dirname(modulePath),
    join(root, "modules", "puzzleManifest.js")
  ).replaceAll(sep, "/");
  if (!manifestImport.startsWith(".")) manifestImport = `./${manifestImport}`;
  return `// Generated from ${canonicalRelativePath}.\n` +
    "// Edit the JSON-LD source and re-import it rather than editing this file directly.\n\n" +
    `import { definePuzzle } from "${manifestImport}";\n\n` +
    `export default definePuzzle(import.meta.url, ${JSON.stringify(puzzle, null, 2)});\n`;
}

function registerPuzzle(registry, puzzle, modulePath) {
  const variable = variableName(puzzle.id);
  const importPath = `./${relative(join(root, "puzzles"), modulePath).replaceAll(sep, "/")}`;
  const commentMarker = "\n// Cross-disciplinary membership";
  const importLine = `import ${variable} from "${importPath}";`;
  let updated = registry;
  const markerIndex = updated.indexOf(commentMarker);
  if (markerIndex < 0) throw new Error("Could not locate puzzle registry import boundary");
  updated = `${updated.slice(0, markerIndex)}\n${importLine}${updated.slice(markerIndex)}`;
  const arrayStart = updated.indexOf("export const PUZZLES = [");
  const arrayEnd = updated.indexOf("\n];", arrayStart);
  if (arrayStart < 0 || arrayEnd < 0) throw new Error("Could not locate PUZZLES registry array");
  const before = updated.slice(0, arrayEnd).trimEnd();
  return `${before},\n  ${variable}${updated.slice(arrayEnd)}`;
}

function addCatalogueEntry(source, entry) {
  const closing = source.lastIndexOf("\n  ]\n};");
  if (closing < 0) throw new Error("Could not locate catalogue entries array");
  const block = JSON.stringify(entry, null, 2)
    .split("\n")
    .map(line => `    ${line}`)
    .join("\n");
  return `${source.slice(0, closing).trimEnd()},\n${block}${source.slice(closing)}`;
}

async function applyTransaction(changes) {
  const originals = new Map();
  try {
    for (const [path, content] of changes) {
      try {
        originals.set(path, await readFile(path, "utf8"));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        originals.set(path, null);
      }
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, "utf8");
    }
    const validation = spawnSync(process.execPath, ["validate.mjs"], {
      cwd: root,
      encoding: "utf8"
    });
    if (validation.status !== 0) {
      throw new Error(`Repository validation failed:\n${validation.stdout}${validation.stderr}`);
    }
  } catch (error) {
    for (const [path, original] of [...originals].reverse()) {
      if (original === null) await unlink(path).catch(() => {});
      else await writeFile(path, original, "utf8");
    }
    throw error;
  }
}

async function importCommand(args) {
  if (args.files.length !== 1) usage("Import requires one puzzle JSON-LD file.");
  const loaded = await readDocument(args.files[0]);
  if (loaded.document["@type"] !== JSON_LD_TYPES.puzzle) {
    throw new Error("Repository import currently accepts Puzzle documents; catalogue bundles can be exported and checked but are not installed yet.");
  }
  const document = await materializeImportedLearning(loaded.document, loaded.path);
  const profileErrors = validateJsonLdProfile(document);
  if (profileErrors.length) throw new Error(`Profile validation failed:\n- ${profileErrors.join("\n- ")}`);
  const puzzle = puzzleFromJsonLd(document);
  const existing = await existingPuzzleModule(puzzle.id);
  if (existing && !args.replace) {
    throw new Error(`Puzzle "${puzzle.id}" already exists; pass --replace to update it.`);
  }
  const knownIds = new Set(PUZZLES.map(item => item.id));
  knownIds.add(puzzle.id);
  const semanticErrors = validatePuzzleContent(puzzle, { knownPuzzleIds: knownIds });
  if (semanticErrors.length) throw new Error(`Semantic validation failed:\n- ${semanticErrors.join("\n- ")}`);

  const categoryDirectory = slugify(puzzle.category);
  const modulePath = existing || join(root, "puzzles", categoryDirectory, `${puzzle.id}.js`);
  definePuzzle(pathToFileURL(modulePath), puzzle);
  const learningErrors = await validateLearningIntroduction(puzzle);
  if (learningErrors.length) throw new Error(`Learning introduction validation failed:\n- ${learningErrors.join("\n- ")}`);

  const canonicalPath = join(root, "content", "puzzles", `${puzzle.id}.ccpuzzle.jsonld`);
  const canonicalRelative = relative(root, canonicalPath).replaceAll(sep, "/");
  const changes = new Map([
    [canonicalPath, pretty(document)],
    [modulePath, generatedModule(puzzle, canonicalRelative, modulePath)]
  ]);
  if (!existing) {
    const registryPath = join(root, "puzzles", "index.js");
    changes.set(registryPath, registerPuzzle(
      await readFile(registryPath, "utf8"), puzzle, modulePath
    ));
  }
  if (args.catalogue) {
    const catalogue = CATALOGUES.find(item => item.id === args.catalogue);
    if (!catalogue) throw new Error(`Unknown catalogue: ${args.catalogue}`);
    if (!catalogue.entries.some(entry => entry.id === puzzle.id)) {
      const path = join(root, "catalogues", `${catalogue.id}.js`);
      changes.set(path, addCatalogueEntry(await readFile(path, "utf8"), {
        id: puzzle.id,
        ...(args.reason ? { reason: args.reason } : {})
      }));
    }
  } else if (args.reason) {
    throw new Error("--reason requires --catalogue");
  }

  console.log(`${args.dryRun ? "Would update" : "Updating"}:`);
  [...changes.keys()].forEach(path => console.log(`- ${relative(root, path)}`));
  if (!args.dryRun) {
    await applyTransaction(changes);
    console.log(`Imported ${puzzle.id}; repository validation passed.`);
  }
}

const [command, ...rawArgs] = process.argv.slice(2);
const args = parseArgs(rawArgs);
try {
  if (command === "export") await exportCommand(args);
  else if (command === "check") await checkCommand(args);
  else if (command === "import") await importCommand(args);
  else usage(command ? `Unknown command: ${command}` : "A command is required.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
