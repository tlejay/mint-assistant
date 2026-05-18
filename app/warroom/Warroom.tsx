"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const PIN = "1235";
const STORAGE_KEY = "mint_warroom_unlocked";
const UNLOCK_TTL_MS = 24 * 60 * 60 * 1000;

type ConfigEntry = {
  key: string;
  value: unknown;
  label: string;
  category: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
};

function isUnlockedNow(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const ts = Number.parseInt(raw, 10);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < UNLOCK_TTL_MS;
}

export default function Warroom() {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUnlocked(isUnlockedNow());
  }, []);

  const onUnlock = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setUnlocked(true);
  }, []);

  const onLock = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  }, []);

  if (!mounted) {
    return <div className="text-center text-zinc-500 py-20">Loading…</div>;
  }

  if (!unlocked) {
    return <Lock onUnlock={onUnlock} />;
  }
  return <ConfigBoard onLock={onLock} />;
}

/* ──────────────── Lock screen ──────────────── */

function Lock({ onUnlock }: { onUnlock: () => void }) {
  const [entry, setEntry] = useState("");
  const [shake, setShake] = useState(false);

  const keys = useMemo(
    () => ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"],
    [],
  );

  const submit = useCallback(
    (val: string) => {
      if (val === PIN) {
        onUnlock();
      } else {
        setShake(true);
        setEntry("");
        setTimeout(() => setShake(false), 400);
      }
    },
    [onUnlock],
  );

  const press = useCallback(
    (k: string) => {
      if (k === "⌫") {
        setEntry((s) => s.slice(0, -1));
        return;
      }
      if (k === "✓") {
        submit(entry);
        return;
      }
      if (entry.length >= 4) return;
      const next = entry + k;
      setEntry(next);
      if (next.length === 4) {
        // small delay so the user sees the 4th dot fill before validate
        setTimeout(() => submit(next), 120);
      }
    },
    [entry, submit],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") press(e.key);
      else if (e.key === "Backspace") press("⌫");
      else if (e.key === "Enter") press("✓");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="mb-3 text-sm uppercase tracking-widest text-rose-600 dark:text-rose-300">
        🛠 Warroom locked
      </div>
      <div
        className={`flex gap-3 mb-8 transition-transform ${
          shake ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
        aria-label="PIN entry indicator"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i < entry.length
                ? "bg-rose-500 border-rose-500"
                : "border-zinc-300 dark:border-zinc-700"
            } transition-colors`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 w-64">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="h-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-2xl font-medium hover:bg-rose-50 dark:hover:bg-zinc-800 active:scale-95 transition"
          >
            {k}
          </button>
        ))}
      </div>
      <p className="mt-8 text-xs text-zinc-500 max-w-xs text-center">
        Soft lock. PIN is a cosmetic gate — anyone who knows it can read + edit
        config. Not a substitute for auth.
      </p>
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

/* ──────────────── Config board ──────────────── */

function ConfigBoard({ onLock }: { onLock: () => void }) {
  const [entries, setEntries] = useState<ConfigEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/config", {
        headers: { "X-Warroom-Pin": PIN },
        cache: "no-store",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? `HTTP ${res.status}`);
        setEntries([]);
        return;
      }
      const json = (await res.json()) as { entries: ConfigEntry[] };
      setEntries(json.entries);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const grouped = useMemo(() => {
    if (!entries) return [];
    const map = new Map<string, ConfigEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.category) ?? [];
      arr.push(e);
      map.set(e.category, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [entries]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          🛠 Mint Config Warroom
        </h1>
        <button
          onClick={onLock}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-zinc-800 transition"
        >
          Lock 🔒
        </button>
        <button
          onClick={() => void reload()}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-zinc-800 transition"
        >
          Reload
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-700 p-4 text-sm text-rose-700 dark:text-rose-200">
          Error: {error}
        </div>
      )}

      {entries === null && !error && (
        <div className="text-zinc-500">Loading config…</div>
      )}

      {grouped.map(([cat, items]) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-rose-700 dark:text-rose-300">
            {cat}
          </h2>
          <div className="space-y-3">
            {items.map((it) => (
              <EntryCard key={it.key} entry={it} onSaved={reload} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ──────────────── Entry card ──────────────── */

function EntryCard({
  entry,
  onSaved,
}: {
  entry: ConfigEntry;
  onSaved: () => void;
}) {
  const initialKind = useMemo(() => kindOf(entry.value), [entry.value]);

  const [draft, setDraft] = useState<string>(() => valueToDraft(entry.value));
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<null | "saved" | "error">(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // re-sync the draft if the upstream entry changes (e.g. after reload)
  useEffect(() => {
    setDraft(valueToDraft(entry.value));
    setStatus(null);
    setStatusMsg(null);
  }, [entry.value]);

  async function save(nextValue: unknown) {
    setBusy(true);
    setStatus(null);
    setStatusMsg(null);
    try {
      const res = await fetch(
        `/api/config?key=${encodeURIComponent(entry.key)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Warroom-Pin": PIN,
          },
          body: JSON.stringify({ value: nextValue, updated_by: "warroom" }),
        },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setStatus("error");
        setStatusMsg(body?.error ?? `HTTP ${res.status}`);
      } else {
        setStatus("saved");
        onSaved();
      }
    } catch (e) {
      setStatus("error");
      setStatusMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-baseline gap-3 mb-1">
        <div className="font-medium">{entry.label}</div>
        <code className="text-[11px] text-zinc-500">{entry.key}</code>
      </div>
      {entry.description && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
          {entry.description}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {initialKind === "bool" && (
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft === "true"}
              disabled={busy}
              onChange={(e) => {
                const next = e.target.checked;
                setDraft(String(next));
                void save(next);
              }}
              className="w-5 h-5 accent-rose-500"
            />
            <span className="text-sm">{draft === "true" ? "ON" : "OFF"}</span>
          </label>
        )}

        {initialKind === "number" && (
          <>
            <input
              type="number"
              value={draft}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              className="w-32 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
            />
            <button
              onClick={() => {
                const n = Number(draft);
                if (Number.isNaN(n)) {
                  setStatus("error");
                  setStatusMsg("not a number");
                  return;
                }
                void save(n);
              }}
              disabled={busy}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Save
            </button>
          </>
        )}

        {initialKind === "string" && (
          <>
            <input
              type="text"
              value={draft}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-mono"
            />
            <button
              onClick={() => void save(draft)}
              disabled={busy}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Save
            </button>
          </>
        )}

        {initialKind === "json" && (
          <div className="flex w-full flex-col gap-2">
            <textarea
              value={draft}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.max(3, draft.split("\n").length)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono"
            />
            <button
              onClick={() => {
                try {
                  const parsed = JSON.parse(draft);
                  void save(parsed);
                } catch {
                  setStatus("error");
                  setStatusMsg("invalid JSON");
                }
              }}
              disabled={busy}
              className="self-start text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Save JSON
            </button>
          </div>
        )}

        <div className="ml-auto text-[11px] text-zinc-500 dark:text-zinc-400">
          {new Date(entry.updated_at).toLocaleString("en-GB")} ·{" "}
          {entry.updated_by ?? "—"}
        </div>
      </div>

      {status === "saved" && (
        <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
          saved ✓
        </div>
      )}
      {status === "error" && (
        <div className="mt-2 text-xs text-rose-700 dark:text-rose-300">
          save failed: {statusMsg}
        </div>
      )}
    </div>
  );
}

type Kind = "bool" | "number" | "string" | "json";

function kindOf(v: unknown): Kind {
  if (typeof v === "boolean") return "bool";
  if (typeof v === "number") return "number";
  if (typeof v === "string") return "string";
  return "json";
}

function valueToDraft(v: unknown): string {
  if (typeof v === "boolean") return String(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  return JSON.stringify(v, null, 2);
}
