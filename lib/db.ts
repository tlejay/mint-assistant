import { neon } from "@neondatabase/serverless";

export type ConfigEntry = {
  key: string;
  value: unknown;
  label: string;
  category: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
};

function client() {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error("DATABASE_URL not configured");
  return neon(dsn);
}

export async function listConfig(): Promise<ConfigEntry[]> {
  const sql = client();
  const rows = (await sql`
    SELECT key, value, label, category, description, updated_at, updated_by
    FROM config_entries
    ORDER BY category, key
  `) as ConfigEntry[];
  return rows;
}

export async function updateConfig(
  key: string,
  value: unknown,
  updatedBy: string | null,
): Promise<ConfigEntry | null> {
  const sql = client();
  const rows = (await sql`
    UPDATE config_entries
    SET value = ${JSON.stringify(value)}::jsonb,
        updated_at = NOW(),
        updated_by = ${updatedBy}
    WHERE key = ${key}
    RETURNING key, value, label, category, description, updated_at, updated_by
  `) as ConfigEntry[];
  return rows[0] ?? null;
}
