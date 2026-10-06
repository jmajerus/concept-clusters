// A minimal D1 binding over node:sqlite with every migration applied, for
// repository tests that need real SQL (guards, batches, migrations).
import { DatabaseSync } from "node:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const migrations = join(dirname(fileURLToPath(import.meta.url)), "../../d1/migrations");

export function applyMigrations(sqlite, { through = Infinity, before = () => {} } = {}) {
  for (const file of readdirSync(migrations).filter(name => name.endsWith(".sql")).sort()) {
    const number = Number.parseInt(file, 10);
    if (number > through) break;
    before(number, sqlite);
    sqlite.exec(readFileSync(join(migrations, file), "utf8"));
  }
}

class Statement {
  constructor(sqlite, sql, bindings = []) {
    this.sqlite = sqlite;
    this.sql = sql;
    this.bindings = bindings;
  }
  bind(...bindings) {
    return new Statement(this.sqlite, this.sql, bindings);
  }
  execute() {
    const statement = this.sqlite.prepare(this.sql);
    if (statement.columns().length) {
      return { results: statement.all(...this.bindings), meta: { changes: 0 } };
    }
    const { changes } = statement.run(...this.bindings);
    return { results: [], meta: { changes: Number(changes) } };
  }
  async first() {
    return this.execute().results[0] ?? null;
  }
  async all() {
    return this.execute();
  }
  async run() {
    return this.execute();
  }
}

export function createSqliteD1(options) {
  const sqlite = new DatabaseSync(":memory:");
  applyMigrations(sqlite, options);
  return {
    sqlite,
    prepare: sql => new Statement(sqlite, sql),
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map(statement => statement.execute());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    }
  };
}
