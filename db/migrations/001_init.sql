-- 001_init.sql — config_entries table + initial seed
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS config_entries (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  label       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  TEXT
);

CREATE INDEX IF NOT EXISTS config_entries_category_idx
  ON config_entries (category, key);

-- Seed ---------------------------------------------------------------------

-- sell-post
INSERT INTO config_entries (key, value, label, category, description) VALUES
  ('sell_post.paused', 'false'::jsonb, 'Paused', 'sell-post', 'Master pause switch for the sell-post loop.'),
  ('sell_post.enabled', 'true'::jsonb, 'Enabled', 'sell-post', 'Master enable switch for the sell-post loop.'),
  ('sell_post.dry_run', 'false'::jsonb, 'Dry-run mode', 'sell-post', 'If true, simulate posts (Haiku caption + selector resolution) but never click Post.'),
  ('sell_post.scope', '"high"'::jsonb, 'Group scope', 'sell-post', 'Which group cohort to post to. Values: high / medium / low / all.'),
  ('sell_post.seller_id', '1'::jsonb, 'Seller id', 'sell-post', 'Which seller''s catalog to draw from.'),
  ('sell_post.prime_windows',
    '[["09:00","10:30"],["14:30","16:00"],["19:30","21:00"]]'::jsonb,
    'Prime windows', 'sell-post', 'Time-of-day windows (Asia/Bangkok) in which the loop is allowed to fire.'),
  ('sell_post.exclude_recent_hours', '24'::jsonb, 'Exclude recent (hours)', 'sell-post', 'Skip products already posted within the last N hours.'),
  ('sell_post.max_groups', '5'::jsonb, 'Max groups per tick', 'sell-post', 'Cap on the number of groups a single tick will post into.')
ON CONFLICT (key) DO NOTHING;

-- scheduler
INSERT INTO config_entries (key, value, label, category, description) VALUES
  ('scheduler.mbt_sellpost_tick.enabled', 'true'::jsonb, 'mbt-sellpost-tick', 'scheduler', 'interval 9 min — fire sell-post tick.'),
  ('scheduler.mbt_rebuild_queue_daily.enabled', 'true'::jsonb, 'mbt-rebuild-queue-daily', 'scheduler', 'cron 23:00 — rebuild sell-post queue.'),
  ('scheduler.mint_companion.enabled', 'true'::jsonb, 'mint-companion', 'scheduler', 'interval 15 min — proactive cute ping (quiet 23:00-09:00).'),
  ('scheduler.mint_nightly_cleanup.enabled', 'true'::jsonb, 'mint-nightly-cleanup', 'scheduler', 'cron 05:00 — sweep /tmp + .hist, then auto-/compact sub-agent panes.'),
  ('scheduler.elevenlabs_quota_check.enabled', 'true'::jsonb, 'elevenlabs-quota-check', 'scheduler', 'cron 09:30 — alert if TTS quota low.')
ON CONFLICT (key) DO NOTHING;

-- persona
INSERT INTO config_entries (key, value, label, category, description) VALUES
  ('persona.pronouns_strict', 'true'::jsonb, 'Strict pronouns', 'persona', 'Mint never says ผม / ครับ — always มิ้น / ค่ะ / น้า.'),
  ('persona.delegate_english', 'true'::jsonb, 'Delegate prompts in English', 'persona', 'Sub-agent prompts go out in English (token-efficient).'),
  ('persona.no_no_wake_on_result', 'true'::jsonb, 'No --no-wake on result-send', 'persona', 'Sub-agents must never pass --no-wake when inbox-send''ing a result to mint.')
ON CONFLICT (key) DO NOTHING;

-- ghostpilot
INSERT INTO config_entries (key, value, label, category, description) VALUES
  ('ghostpilot.tools_filter', '"all"'::jsonb, 'Tools filter (GHOSTPILOT_TOOLS)', 'ghostpilot', 'Which tool categories to expose. Values: "core" | "core,network" | "all".'),
  ('ghostpilot.headless', 'false'::jsonb, 'Headless mode', 'ghostpilot', 'Run GhostPilot with no visible window / dock icon. CLI flag --headless wins if both set.')
ON CONFLICT (key) DO NOTHING;

-- line
INSERT INTO config_entries (key, value, label, category, description) VALUES
  ('line.watch_list',
    '["eM","EXPO K-BATTLE","ปิ้งม่วน ก๊วนย่าง","บอร์ดสมาคมดิจิตอลนครราชสีมา (NDA)","S-M-E : BNI","BNI (ทั่วไป) - Power Chapter","YED : YOLO Entrepreneur Development"]'::jsonb,
    'LINE watch list', 'line', 'Rooms /check-line will focus on. fuzzy-matched against actual LINE room names.')
ON CONFLICT (key) DO NOTHING;
