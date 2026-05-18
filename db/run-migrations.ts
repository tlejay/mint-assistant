/**
 * One-off migration runner.
 *
 *   DATABASE_URL=... pnpm exec tsx db/run-migrations.ts
 *
 * Reads every .sql file under db/migrations/ in lexicographic order, splits
 * it into individual statements (Neon's HTTP driver requires one statement
 * per request), and runs each one. Migrations are written to be idempotent
 * (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`) so re-running is safe.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

function stripComments(src: string): string {
  return src
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
}

function splitStatements(sql: string): string[] {
  // Naive split: not safe for SQL containing semicolons inside string
  // literals. Our migrations don't have that, and we control the input.
  return stripComments(sql)
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) {
    console.error("DATABASE_URL not set; aborting.");
    process.exit(1);
  }

  const sql = neon(dsn);

  const dir = path.join(process.cwd(), "db", "migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("(no migration files found in db/migrations)");
    return;
  }

  for (const f of files) {
    const body = readFileSync(path.join(dir, f), "utf8");
    const statements = splitStatements(body);
    console.log(`-- running ${f} (${statements.length} statements)`);
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.slice(0, 60).replace(/\s+/g, " ");
      try {
        await sql.query(stmt);
        console.log(`   [${i + 1}/${statements.length}] ok  : ${preview}…`);
      } catch (e) {
        console.error(`   [${i + 1}/${statements.length}] FAIL: ${preview}…`);
        throw e;
      }
    }
    console.log(`-- done ${f}`);
  }

  const rows = (await sql`SELECT COUNT(*)::int AS n FROM config_entries`) as Array<{ n: number }>;
  console.log(`\nconfig_entries row count: ${rows[0]?.n}`);

  const byCat = (await sql`
    SELECT category, COUNT(*)::int AS n
    FROM config_entries
    GROUP BY category
    ORDER BY category
  `) as Array<{ category: string; n: number }>;
  for (const r of byCat) {
    console.log(`  ${r.category.padEnd(12)} ${r.n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
