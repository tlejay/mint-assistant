/**
 * One-off backfill: write an English `purpose` description into every
 * config_entries row so พี่เติ้ล can scan the warroom UI quickly.
 *
 *   DATABASE_URL=... pnpm exec tsx db/seed-descriptions.ts
 *
 * Idempotent: this runs UPDATE per key, so re-running just overwrites with
 * the same string. Safe to invoke any number of times.
 */
import { neon } from "@neondatabase/serverless";

const DESCRIPTIONS: Record<string, string> = {
  // sell-post
  "sell_post.paused":
    "Hard pause flag. When true the scheduler still ticks but skips every fire — use to halt all posting without un-scheduling.",
  "sell_post.enabled":
    "Master switch. When false the bot exits early on every tick. Stronger than paused (no log noise).",
  "sell_post.dry_run":
    "Run end-to-end but never click the Post button. Useful for verifying flow without leaving real posts on FB.",
  "sell_post.scope":
    "Group priority filter: 'high' = priority-A groups only, 'all' = every eligible group. Controls breadth of posting.",
  "sell_post.seller_id":
    "Numeric ID of the mbt-store seller whose catalog drives the bot. Currently 1 = เบิร์ด สตั๊ดมือ 2 ของแท้.",
  "sell_post.prime_windows":
    "Allowed posting hours in 24h format. Bot fires only inside one of these windows. Default 3 windows per day.",
  "sell_post.exclude_recent_hours":
    "Server-side dedupe window passed to /api/products/pick. Codes posted within this many hours are excluded.",
  "sell_post.max_groups":
    "Max number of groups to post into per scheduler tick. Prevents flooding when multiple windows overlap.",

  // scheduler
  "scheduler.mbt_sellpost_tick.enabled":
    "9-min recurring tick that fires the sell-post pipeline if inside a prime_window and not paused.",
  "scheduler.mbt_rebuild_queue_daily.enabled":
    "Daily 04:00 rebuild of the sell-post queue from the seller's catalog. Off = bot uses stale queue.",
  "scheduler.mint_companion.enabled":
    "Lightweight ping that keeps the embedded browser session warm + posts hourly health to Discord.",
  "scheduler.mint_nightly_cleanup.enabled":
    "Nightly 03:00 cleanup of /tmp leftovers, expired tasks, and rotated logs. Safe to disable temporarily.",
  "scheduler.elevenlabs_quota_check.enabled":
    "Daily ElevenLabs TTS quota probe. Posts low-quota warning to Discord when remaining minutes drop below threshold.",

  // persona
  "persona.pronouns_strict":
    "If true, Mint refuses to use male pronouns (ผม/ครับ). She only uses มิ้น/หนู + ค่ะ/นะคะ/น้า. Default true.",
  "persona.delegate_english":
    "If true, prompts that Mint delegates to Techie/Techoe are written in English (saves tokens). Reports back in Thai.",
  "persona.no_no_wake_on_result":
    "Forbids sub-agents from passing --no-wake on a result inbox-send to Mint. Ensures Mint surfaces replies immediately.",

  // ghostpilot
  "ghostpilot.tools_filter":
    "Comma-separated tool category filter (e.g. 'core,network'). Reduces MCP surface to save tokens. 'all' = expose every tool.",
  "ghostpilot.headless":
    "Run GhostPilot with no visible window / dock icon. CLI flag --headless wins if both set.",

  // line
  "line.watch_list":
    "Group/chat names Mint monitors in LINE. Used by /check-line skill to scope the routine. Order = priority.",
};

async function main() {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) {
    console.error("DATABASE_URL not set; aborting.");
    process.exit(1);
  }
  const sql = neon(dsn);

  let updated = 0;
  let missing: string[] = [];
  for (const [key, description] of Object.entries(DESCRIPTIONS)) {
    const rows = (await sql`
      UPDATE config_entries
      SET description = ${description}
      WHERE key = ${key}
      RETURNING key
    `) as Array<{ key: string }>;
    if (rows.length === 0) {
      missing.push(key);
    } else {
      updated++;
    }
  }

  console.log(`Updated ${updated} rows.`);
  if (missing.length > 0) {
    console.warn(`Missing keys (no row updated): ${missing.join(", ")}`);
  }

  const rows = (await sql`
    SELECT key, description
    FROM config_entries
    WHERE description IS NULL OR description = ''
  `) as Array<{ key: string; description: string | null }>;
  if (rows.length > 0) {
    console.warn("Rows still without description:");
    for (const r of rows) console.warn(`  - ${r.key}`);
  } else {
    console.log("Every config_entries row now has a description ✓");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
