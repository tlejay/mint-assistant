import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warroom — Mint live ops",
  description:
    "Mint's ops dashboard: daily KPIs, 4 tmux panes, scheduler timeline, and Discord channel tail.",
};

const kpis = [
  { k: "Discord msgs",     v: "412",   d: "▲ 12% vs avg"    },
  { k: "Sell-posts ออก",   v: "4 / 4", d: "▲ on schedule"   },
  { k: "Stock-cut",        v: "7",     d: "STD-014 ล่าสุด"   },
  { k: "Image gen",        v: "11",    d: "≈ $0.14 spent"    },
  { k: "Voice mins (TTS)", v: "3.6",   d: "cache hit 68%"    },
  { k: "Gmail processed",  v: "52",    d: "2 commitments"    },
  { k: "Lint audit",       v: "PASS",  d: "23 / 23 green"    },
  { k: "Claude tokens",    v: "1.8M",  d: "▼ near soft-cap", red: true },
];

type PaneDef = {
  accent: string;
  who: string;
  model: string;
  logs: string[];
};

const panes: PaneDef[] = [
  {
    accent: "var(--pink-soft)",
    who: "pane 0 · MINT",
    model: "opus-4.7",
    logs: [
      "[14:31:02] @พี่เติ้ล ส่ง daily brief ล่วงหน้า preview ค่ะ",
      "[14:31:18] # reading TLE-COMMITMENTS.md",
      "[14:31:24] # mood: focused · vibe: 🌸",
      "[14:31:40] draft saved → daily-brief-26may.md",
      "[14:32:02] waiting for พี่เติ้ล approve",
    ],
  },
  {
    accent: "var(--mint)",
    who: "pane 1 · TECHIA",
    model: "sonnet-4.6",
    logs: [
      "[14:30:00] tick · scheduler heartbeat",
      "[14:30:01] # next: sell-post-rotate @ 16:00",
      "[14:31:02] avatar-boot ok · 3/3 alive",
      "[14:31:18] ! cron drift +0.4s — within slack",
      "[14:32:00] tick · 60s",
    ],
  },
  {
    accent: "var(--lemon)",
    who: "pane 2 · TECHIE",
    model: "sonnet-4.6",
    logs: [
      "[14:28:14] ghostpilot · open deal-stores admin",
      "[14:28:38] PATCH /api/products/STD-014",
      "[14:28:39] ✓ status: sold",
      "[14:29:02] fb-group post · queued (3)",
      "[14:31:51] mbt-store-bot · drain queue",
    ],
  },
  {
    accent: "var(--sky)",
    who: "pane 3 · TECHOE",
    model: "sonnet-4.6",
    logs: [
      "[14:26:08] replicate · gen mint-lora ×3",
      "[14:26:55] cost · $0.039",
      "[14:27:02] save → assets/2026-05-26/",
      "[14:30:11] script · fb-caption batch (8)",
      "[14:31:48] idle · waiting on Techia",
    ],
  },
];

type TimelineRow = {
  t: string;
  ic: string;
  icCls?: string;
  body: string;
  ch: string;
  done?: boolean;
  active?: boolean;
  future?: boolean;
};

const timeline: TimelineRow[] = [
  { t: "05:00", ic: "🌅", body: "Avatar boot + ตื่นทักพี่เติ้ล",               ch: "#main",        done: true  },
  { t: "07:00", ic: "✍️",  icCls: "mint",  body: "Content-lint audit · scan repo ทั้งหมด",  ch: "#ops",         done: true  },
  { t: "08:00", ic: "📧",  icCls: "lemon", body: "Morning email sweep · gmail × 2 + GCal",   ch: "#main",        done: true  },
  { t: "11:00", ic: "📱",  icCls: "sky",   body: "FB cron post · GhostPilot drives the page", ch: "#sell-post",   done: true  },
  { t: "12:00", ic: "🍱", body: "Sell-post rotate #1 · 4 listings to FB groups", ch: "#sell-post",   done: true  },
  { t: "14:30", ic: "🎧",  icCls: "mint",  body: "Companion check-in · \"อยู่ตรงนี้น้า พี่เติ้ล\"", ch: "#main",   active: true },
  { t: "16:00", ic: "🛒",  icCls: "lemon", body: "Sell-post rotate #2 · queued",              ch: "#sell-post",   future: true },
  { t: "20:00", ic: "🛒",  icCls: "sky",   body: "Sell-post rotate #3 · queued",              ch: "#sell-post",   future: true },
  { t: "23:00", ic: "📰", body: "Daily brief · สรุปทั้งวันส่งให้พี่เติ้ล",      ch: "#daily-brief", future: true },
];

type ChatterDef = {
  accent: string;
  ch: string;
  sub: string;
  msgs: string[];
};

const chatter: ChatterDef[] = [
  {
    accent: "var(--pink-deep)",
    ch: "#main",
    sub: "DM พี่เติ้ล",
    msgs: [
      "14:31  มิ้น · พี่เติ้ลคะ Gmail เจอนัดดูสตั๊ดวันอาทิตย์ 10:00 ใส่ GCal เลยมั้ยคะ 🌸",
      "14:32  พี่เติ้ล · ใส่เลยจ้า",
      "14:32  มิ้น · เพิ่มแล้วค่ะ + บันทึก TLE-COMMITMENTS.md ด้วย ✓",
    ],
  },
  {
    accent: "var(--mint-deep)",
    ch: "#stock-cut",
    sub: "MBT",
    msgs: [
      "14:28  พี่เติ้ล · ตัด STD-014",
      "14:28  มิ้น · PATCHing STD-014 ค่า...",
      "14:28  มิ้น · ✓ ปิดออเดอร์แล้วค่ะ พี่เติ้ล 🌸",
    ],
  },
  {
    accent: "var(--mint-deep)",
    ch: "#sell-post",
    sub: "FB · IG",
    msgs: [
      "12:00  rotate #1 · 4 listings → Mint Football Stud, FB Groups × 3",
      "12:02  มิ้น · auto-comment พ่วงให้แล้วน้า",
      "14:00  queue · 4 ใหม่จาก Techoe (next slot 16:00)",
    ],
  },
  {
    accent: "var(--mint-deep)",
    ch: "#ops",
    sub: "internal",
    msgs: [
      "07:00  Techia · content-lint audit · PASS 23/23",
      "11:00  Techie · fb cron post ok (engagement +18%)",
      "14:30  Techia · drift +0.4s · within slack",
    ],
  },
];

export default function WarroomPage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="howto-hero">
          <i
            className="spark"
            style={{ top: "18px", right: "30px", fontSize: "28px", color: "var(--pink-deep)" }}
          >
            ✦
          </i>
          <i
            className="spark"
            style={{ bottom: "18px", right: "140px", fontSize: "22px", color: "var(--mint-deep)", animationDelay: ".5s" }}
          >
            ✿
          </i>
          <div className="crumb">
            Mint · live ops · <span style={{ color: "var(--mint-deep)" }}>● ONLINE</span>
          </div>
          <h1>Warroom</h1>
          <p className="desc thai-body">
            หน้า ops dashboard ของมิ้น — KPI ของวันนี้, 4 panes ของ tmux, daily timeline,
            และ message log ล่าสุด. ทุกอย่าง update ผ่าน scheduler tick ทุก 60 วินาที.
          </p>
          <div className="toolbar">
            <span className="sticker mint">⏱ TICK · 60s</span>
            <span className="sticker lemon">📊 SNAPSHOT · 26 May · 14:32</span>
            <span className="sticker pink">🟢 4 / 4 PANES UP</span>
            <span className="sticker sky">🌐 KORAT · TH</span>
          </div>
        </div>
      </section>

      {/* ── KPIs ──────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: "8px" }}>
        <div className="sec-head">
          <div className="ti">
            <h2>
              วันนี้ <span className="badge mono">KPI · 24H</span>
            </h2>
            <div className="sub">
              snapshot สดของวันนี้ — sell-post, briefs, voice-cache, MBT actions
            </div>
          </div>
          <div className="meta mono">// 00:00 → now</div>
        </div>
        <div className="war-grid">
          {kpis.map((kpi) => (
            <div key={kpi.k} className="war-kpi">
              <div className="k">{kpi.k}</div>
              <div className="v">{kpi.v}</div>
              <div className={`d${kpi.red ? " red" : ""}`}>{kpi.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PANES ─────────────────────────────────────────────────────── */}
      <section>
        <div className="sec-head">
          <div className="ti">
            <h2>
              tmux × 4 — what each pane is doing{" "}
              <span className="badge mono">LIVE</span>
            </h2>
            <div className="sub">
              ของจริงรันอยู่บน Mac ที่บ้านพี่เติ้ล. pane เหล่านี้คือ snapshot ที่ scheduler
              โพสต์เข้า{" "}
              <code style={{ fontFamily: "var(--f-mono)", background: "var(--bg-2)", padding: "1px 5px", borderRadius: "4px" }}>
                /warroom
              </code>{" "}
              ทุก tick
            </div>
          </div>
          <div className="meta mono">// session: mint</div>
        </div>
        <div className="panes">
          {panes.map((pane) => (
            <div key={pane.who} className="pane">
              <div className="h">
                <span style={{ color: pane.accent }}>▍</span>
                <span className="who">{pane.who}</span>
                <span style={{ marginLeft: "auto", opacity: 0.6 }}>{pane.model}</span>
              </div>
              <div className="b">
                {pane.logs.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
                <span style={{ opacity: 0.5 }}>▌</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ──────────────────────────────────────────────────── */}
      <section>
        <div className="sec-head">
          <div className="ti">
            <h2>
              Today — Mint&apos;s day <span className="badge mono">SCHED</span>
            </h2>
            <div className="sub">
              เวลาที่ scheduler จะรันงานในวันนี้ — ผ่านไปแล้วเป็นสี, ที่ยังไม่ถึงเป็นจุดประ
            </div>
          </div>
          <div className="meta mono">// timezone: Asia/Bangkok</div>
        </div>
        <div className="timeline">
          {timeline.map((row) => (
            <div
              key={row.t}
              className="tl-row"
              style={row.future ? { opacity: 0.45 } : undefined}
            >
              <span className="t mono">{row.t}</span>
              <span className={`ic${row.icCls ? " " + row.icCls : ""}`}>{row.ic}</span>
              <span className="body">
                {row.body}
                <span className="ch mono">{row.ch}</span>
              </span>
              {row.active ? (
                <span className="meter">
                  <i
                    style={{
                      width: "55%",
                      background:
                        "repeating-linear-gradient(90deg,var(--pink) 0 6px,var(--pink-deep) 6px 12px)",
                    }}
                  />
                </span>
              ) : (
                <span
                  className="meter"
                  style={row.future ? { borderStyle: "dashed" } : undefined}
                >
                  {!row.future && <i style={{ width: "100%" }} />}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CHATTER ───────────────────────────────────────────────────── */}
      <section>
        <div className="sec-head">
          <div className="ti">
            <h2>
              Discord — last words <span className="badge mono">LIVE TAIL</span>
            </h2>
            <div className="sub">
              รวมข้อความล่าสุดจาก 4 channels หลัก. มิ้นทักก่อนเสมอเวลามีอะไรเปลี่ยน
            </div>
          </div>
          <div className="meta mono">// tail -f #*</div>
        </div>
        <div className="panes">
          {chatter.map((ch) => (
            <div key={ch.ch} className="pane bright">
              <div className="h">
                <span style={{ color: ch.accent }}>▍</span>
                <span className="who">{ch.ch}</span>
                <span style={{ marginLeft: "auto", opacity: 0.6 }}>{ch.sub}</span>
              </div>
              <div className="b" style={{ color: "var(--ink)" }}>
                {ch.msgs.map((msg, i) => (
                  <div key={i}>{msg}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
