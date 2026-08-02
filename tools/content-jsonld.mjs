import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createContentInterchangeService,
  DEFAULT_REPOSITORY_ROOT
} from "../modules/contentInterchangeService.js";
import {
  ContentValidationError,
  createRepositoryPublicationService
} from "../modules/repositoryPublicationService.js";

const content = createContentInterchangeService();
const publisher = createRepositoryPublicationService({ contentService: content });

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
      const key = arg.slice(2).replace(
        /-([a-z])/g,
        (_, letter) => letter.toUpperCase()
      );
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

async function writeOutput(document, output, fallbackName) {
  const text = `${JSON.stringify(document, null, 2)}\n`;
  if (output === "-") {
    process.stdout.write(text);
    return;
  }
  const target = resolve(output || fallbackName);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text, "utf8");
  const relativeTarget = relative(DEFAULT_REPOSITORY_ROOT, target);
  console.log(
    `Wrote ${relativeTarget.startsWith("..") ? target : relativeTarget}`
  );
}

async function exportCommand(args) {
  if (args.catalogue) {
    const document = await content.exportCatalogueJsonLd(args.catalogue, {
      manifest: !!args.manifest
    });
    const suffix = args.manifest ? "cccatalogue.jsonld" : "ccbundle.jsonld";
    return writeOutput(
      document,
      args.output,
      `${args.catalogue}.${suffix}`
    );
  }
  if (args.files.length !== 1) usage("Export requires one puzzle id.");
  const document = await content.getPuzzleJsonLd(args.files[0]);
  return writeOutput(
    document,
    args.output,
    `${args.files[0]}.ccpuzzle.jsonld`
  );
}

async function checkCommand(args) {
  if (!args.files.length) usage("Check requires at least one JSON-LD file.");
  let failed = false;
  for (const filename of args.files) {
    try {
      const { path, document } = await content.readJsonLdFile(filename);
      const validation = await content.validateJsonLdDocument(document, {
        sourceUrl: pathToFileURL(path),
        repositoryAware: true
      });
      if (validation.valid) {
        console.log(`Valid: ${filename}`);
      } else {
        failed = true;
        console.error(`${filename}:\n- ${validation.errors.join("\n- ")}`);
      }
    } catch (error) {
      failed = true;
      console.error(error.message);
    }
  }
  if (failed) process.exitCode = 1;
}

async function importCommand(args) {
  if (args.files.length !== 1) {
    usage("Import requires one puzzle JSON-LD file.");
  }
  const loaded = await content.readJsonLdFile(args.files[0]);
  const plan = await publisher.planPuzzleImport(loaded.document, {
    replace: !!args.replace,
    catalogueId: args.catalogue || null,
    reason: args.reason || null,
    sourcePath: loaded.path
  });
  console.log(`${args.dryRun ? "Would update" : "Updating"}:`);
  plan.affectedPaths.forEach(path => console.log(`- ${path}`));
  if (args.dryRun) return;
  await publisher.applyPuzzleImport(plan, {
    approvalToken: plan.approvalToken
  });
  console.log(`Imported ${plan.puzzle.id}; repository validation passed.`);
}

const [command, ...rawArgs] = process.argv.slice(2);
const args = parseArgs(rawArgs);
try {
  if (command === "export") await exportCommand(args);
  else if (command === "check") await checkCommand(args);
  else if (command === "import") await importCommand(args);
  else usage(command ? `Unknown command: ${command}` : "A command is required.");
} catch (error) {
  if (error instanceof ContentValidationError) {
    console.error(`${error.message}:\n- ${error.errors.join("\n- ")}`);
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
}
