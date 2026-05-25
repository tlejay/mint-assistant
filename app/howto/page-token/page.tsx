import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

export const metadata: Metadata = {
  title: "Long-lived FB Page Access Token — Mint how-to",
  description:
    "Step-by-step วิธีดึง Facebook Page token ที่ไม่มีวันหมดอายุ — สร้าง FB App, gen token ใน Graph Explorer, exchange เป็น long-lived, เก็บไว้ใน Keychain.",
};

const BASE = "/howto/page-token";

// ── Step 1: Create Facebook App (screenshots 01–08) ────────────────────────
const step1Shots = [
  { src: `${BASE}/01-my-apps.png`,        alt: "My Apps page — developers.facebook.com/apps" },
  { src: `${BASE}/02-create-app.png`,      alt: "Create App modal" },
  { src: `${BASE}/03-app-name.png`,        alt: "App name and contact email" },
  { src: `${BASE}/04-use-cases.png`,       alt: "Use case selection" },
  { src: `${BASE}/05-pages-use-case.png`,  alt: "Pages use case selected" },
  { src: `${BASE}/06-app-dashboard.png`,   alt: "App Dashboard with App ID" },
  { src: `${BASE}/07-customize-perms.png`, alt: "Customize permissions page" },
  { src: `${BASE}/08-perms-ready.png`,     alt: "All 4 permissions ready for testing" },
];

// ── Step 2: Gen short-lived user token (screenshots 09–13) ────────────────
const step2Shots = [
  { src: `${BASE}/09-graph-explorer.png`, alt: "Graph API Explorer with app selected" },
  { src: `${BASE}/10-oauth-approve.png`,  alt: "OAuth approval dialog" },
  { src: `${BASE}/11-pages-selector.png`, alt: "Select which Page to grant access to" },
  { src: `${BASE}/12-review-access.png`,  alt: "Review access permissions" },
  { src: `${BASE}/13-connected.png`,      alt: "Connected — short-lived user token in field" },
];

// ── Step 3: Exchange to long-lived (screenshot 14) ────────────────────────
const step3Shot = { src: `${BASE}/14-app-secret.png`, alt: "App secret revealed in App settings" };

const curlExchange = `# short-lived → long-lived user token (~60 วัน)
curl -G \\
  "https://graph.facebook.com/v19.0/oauth/access_token" \\
  -d "grant_type=fb_exchange_token" \\
  -d "client_id=$APP_ID" \\
  -d "client_secret=$APP_SECRET" \\
  -d "fb_exchange_token=$SHORT_TOKEN"`;

const curlAccounts = `# list pages + page tokens
curl -G "https://graph.facebook.com/v19.0/me/accounts" \\
  -d "access_token=$LONG_USER_TOKEN"`;

const curlPageToken = `# long-lived page token (no expiry)
curl -G "https://graph.facebook.com/v19.0/$PAGE_ID" \\
  -d "fields=access_token" \\
  -d "access_token=$LONG_USER_TOKEN"

# → { "access_token": "EAAB..." , "id": "..." }`;

const curlKeychain = `# save
security add-generic-password \\
  -a "$USER" -s "MINT_FB_PAGE_TOKEN" -w "EAAB..."

# read (inside a script)
PAGE_TOKEN=$(security find-generic-password -w -s "MINT_FB_PAGE_TOKEN")`;

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "var(--f-mono)",
        background: "var(--bg-2)",
        padding: "1px 5px",
        borderRadius: "4px",
      }}
    >
      {children}
    </code>
  );
}

function ShotGrid({ shots }: { shots: { src: string; alt: string }[] }) {
  return (
    <div className="shot-grid">
      {shots.map((s) => (
        <figure key={s.src} className="shot">
          <Image
            src={s.src}
            alt={s.alt}
            width={1200}
            height={900}
            className="shot-img"
            sizes="(max-width: 768px) 100vw, 560px"
          />
          <figcaption className="shot-cap mono">{s.alt}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function PageTokenHowTo() {
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
          <div className="crumb">Mint · how-to · 001 · ~ 12 นาที</div>
          <h1>
            Long-lived Facebook
            <br />
            Page Access Token
          </h1>
          <p className="desc thai-body">
            วิธีดึง Page token ที่{" "}
            <em
              style={{
                fontStyle: "normal",
                background: "var(--lemon)",
                padding: "0 4px",
                borderRadius: "4px",
              }}
            >
              ไม่มีวันหมดอายุ
            </em>{" "}
            มาใช้ automate Page ของตัวเอง — step-by-step + screenshots.
            ใช้ครั้งเดียวเก็บไว้ใน Keychain แล้วลืมมันไปได้เลยค่ะ
          </p>
          <div className="toolbar">
            <span className="sticker pink">⏱ 12 min</span>
            <span className="sticker mint">🪪 Meta dev account</span>
            <span className="sticker lemon">🔑 Page admin</span>
            <span className="sticker sky">💻 cURL / Postman</span>
          </div>
        </div>
      </section>

      {/* ── INTRO ─────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2>ทำไมต้องเป็น long-lived?</h2>
            <p className="thai-body" style={{ marginTop: "10px", fontSize: "15.5px" }}>
              Page token ที่ออกจาก Graph API Explorer ตามปกติจะหมดอายุใน{" "}
              <Code>~ 1 ชม.</Code>. ถ้าอยากให้ bot โพสต์/ตอบ comment ได้ 24/7 ต้อง
              upgrade เป็น long-lived user token ก่อน แล้วค่อย exchange เป็น page token.
              ที่ดีคือ{" "}
              <strong>
                page token ที่ออกมาจาก long-lived user token จะไม่มี expiry
              </strong>{" "}
              ค่ะ — ตามนี้ก็คือใช้ได้ยาวๆ จนกว่าจะ revoke เอง
            </p>
            <p className="thai-body" style={{ fontSize: "15.5px" }}>
              มิ้นใช้ token แบบนี้แหละค่ะ เก็บไว้ใน macOS Keychain ใต้ key{" "}
              <Code>MINT_FB_PAGE_TOKEN</Code> แล้ว <Code>mbt-store-bot</Code> หยิบไปใช้ผ่าน{" "}
              <Code>security find-generic-password</Code>.
            </p>
          </div>
          <aside
            style={{
              border: "var(--border)",
              borderRadius: "var(--r-card)",
              background: "var(--paper)",
              padding: "20px",
              boxShadow: "var(--shadow-hard-sm)",
            }}
          >
            <div
              className="mono"
              style={{ fontSize: "11px", color: "var(--ink-soft)", letterSpacing: ".08em", textTransform: "uppercase" }}
            >
              checklist
            </div>
            <h3 style={{ marginTop: "6px", fontFamily: "var(--f-display)" }}>
              ของที่ต้องมีก่อนเริ่ม
            </h3>
            <ul
              style={{
                margin: "12px 0 0",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {[
                "FB account ที่เป็น admin ของ Page",
                "Meta for Developers app (mode = Live)",
                "App secret + App ID",
                "Terminal ที่มี cURL",
                "ที่เก็บ secret (Keychain / 1Password / .env)",
              ].map((item) => (
                <li
                  key={item}
                  style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px" }}
                >
                  <span style={{ color: "var(--mint-deep)" }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* ── STEPS ─────────────────────────────────────────────────────── */}
      <section>
        <div className="sec-head">
          <div className="ti">
            <h2>
              5 steps · ตามนี้เลยค่ะ{" "}
              <span className="badge mono">STEP-BY-STEP</span>
            </h2>
            <div className="sub">
              รวมเวลาแล้วประมาณ 10–12 นาที ถ้าทำครั้งแรก. ครั้งต่อๆ ไป ใช้แค่ขั้น 4 ก็พอ
            </div>
          </div>
          <div className="meta mono">// fb-page-token.sh</div>
        </div>

        <div className="steps">

          {/* STEP 1 */}
          <div className="step">
            <div className="num">1</div>
            <div className="body">
              <h3>สร้าง Facebook App + ตั้ง permissions</h3>
              <p className="thai-body">
                ไปที่{" "}
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  developers.facebook.com/apps
                </a>{" "}
                กด <strong>Create App</strong>. เลือก use case{" "}
                <strong>Manage everything on your Page</strong> จะ unlock Pages API ให้อัตโนมัติ.
                เมื่อสร้างเสร็จไปที่ Use cases → Customize แล้ว Add permissions:{" "}
                <Code>pages_show_list</Code>, <Code>pages_read_engagement</Code>,{" "}
                <Code>pages_manage_posts</Code>, <Code>pages_manage_engagement</Code>{" "}
                จนทุกตัวขึ้น <em>Ready for testing</em>. จด <strong>App ID</strong> ไว้.
              </p>
              <ShotGrid shots={step1Shots} />
            </div>
          </div>

          {/* STEP 2 */}
          <div className="step">
            <div className="num">2</div>
            <div className="body">
              <h3>เปิด Graph API Explorer แล้ว gen short-lived user token</h3>
              <p className="thai-body">
                ไปที่{" "}
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  developers.facebook.com/tools/explorer
                </a>{" "}
                เลือก app ของเรา. เพิ่ม permissions ทั้ง 4 ตัวแล้วกด{" "}
                <strong>Generate Access Token</strong> — Facebook จะเปิด OAuth popup
                ให้ grant สิทธิ์. เลือกเฉพาะ Page ที่ต้องการแล้ว Save.
                เมื่อ popup ปิด ช่อง Access Token จะมี short-lived user token (~1 ชม.) พร้อมใช้.
              </p>
              <ShotGrid shots={step2Shots} />
            </div>
          </div>

          {/* STEP 3 */}
          <div className="step">
            <div className="num">3</div>
            <div className="body">
              <h3>Copy App Secret แล้ว exchange เป็น long-lived user token (~60 วัน)</h3>
              <p className="thai-body">
                เปิด App settings → Basic แล้วกด Show ที่ช่อง{" "}
                <strong>App secret</strong> — คัดลอกเก็บไว้ใน Keychain,{" "}
                <strong>ห้าม commit ลง git</strong>.
              </p>
              <figure className="shot" style={{ maxWidth: "480px" }}>
                <Image
                  src={step3Shot.src}
                  alt={step3Shot.alt}
                  width={1200}
                  height={900}
                  className="shot-img"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
                <figcaption className="shot-cap mono">{step3Shot.alt}</figcaption>
              </figure>
              <p className="thai-body" style={{ marginTop: "16px" }}>
                จากนั้นรัน cURL นี้ใน terminal — แทน <Code>$APP_ID</Code>,{" "}
                <Code>$APP_SECRET</Code>, <Code>$SHORT_TOKEN</Code> ด้วยของจริง:
              </p>
              <pre>
                <code>{curlExchange}</code>
              </pre>
              <p className="thai-body" style={{ marginTop: "12px" }}>
                response จะมี <Code>access_token</Code> ตัวใหม่ + <Code>expires_in</Code>{" "}
                ประมาณ 5183999 วินาที (~60 วัน) — เก็บไว้ก่อน, อย่าเพิ่งโยน
              </p>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="step">
            <div className="num">4</div>
            <div className="body">
              <h3>ขอ page token แบบไม่หมดอายุ</h3>
              <p className="thai-body">
                เรียก <Code>/me/accounts</Code> ด้วย long-lived user token จะได้ list ของ
                Page ทุกอันที่เราเป็น admin พร้อม id + page token:
              </p>
              <pre>
                <code>{curlAccounts}</code>
              </pre>
              <p className="thai-body" style={{ marginTop: "12px" }}>
                trick คือ — ยิง <Code>/{"{page-id}"}?fields=access_token</Code> โดยใช้{" "}
                <em
                  style={{
                    fontStyle: "normal",
                    background: "var(--lemon)",
                    padding: "0 4px",
                    borderRadius: "4px",
                  }}
                >
                  long-lived user token
                </em>{" "}
                เป็น auth. page token ที่ได้กลับมา{" "}
                <strong>จะไม่มี expires_in</strong> ค่ะ:
              </p>
              <pre>
                <code>{curlPageToken}</code>
              </pre>
              <p className="thai-body" style={{ marginTop: "12px" }}>
                verify ด้วย <Code>/debug_token</Code> ดู <Code>expires_at: 0</Code> หรือ{" "}
                <em>never</em>
              </p>
            </div>
          </div>

          {/* STEP 5 */}
          <div className="step">
            <div className="num">5</div>
            <div className="body">
              <h3>เก็บลง Keychain แล้วเรียกใช้</h3>
              <p className="thai-body">
                บน macOS ใช้ <Code>security add-generic-password</Code> เก็บไว้ในชื่อที่จำง่าย
                จากนั้น script ทุกตัวเรียก token ผ่าน{" "}
                <Code>security find-generic-password -w</Code> — ไม่ต้องเก็บใน .env
                ที่อ่านได้ทั้งบ้าน
              </p>
              <pre>
                <code>{curlKeychain}</code>
              </pre>
              <p className="thai-body" style={{ marginTop: "12px" }}>
                เรียบร้อยค่ะ 🌸 ตอนนี้ <Code>mbt-store-bot</Code> โพสต์ FB
                ได้ตลอดไม่ต้องคอย refresh token แล้ว
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── GOTCHAS ───────────────────────────────────────────────────── */}
      <section>
        <div className="sec-head">
          <div className="ti">
            <h2>
              Gotchas ที่มิ้นโดนมาก่อน{" "}
              <span className="badge mono">เก็บไว้น้า</span>
            </h2>
            <div className="sub">ปัญหาที่เจอตอน setup จริง บันทึกไว้กันลืม</div>
          </div>
        </div>
        <div className="integ" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <article className="integ-card" style={{ gridColumn: "auto" }}>
            <header className="integ-head" style={{ background: "var(--pink)" }}>
              <span className="dots">
                <i /><i /><i />
              </span>
              <span className="title">App mode = Development</span>
            </header>
            <div className="integ-body">
              <p className="thai-body" style={{ fontSize: "14.5px" }}>
                token จะใช้ได้แต่กับ admin/tester ของ app เท่านั้น. switch เป็น{" "}
                <strong>Live</strong> ใน App Dashboard ก่อนใช้จริง
              </p>
            </div>
          </article>
          <article className="integ-card" style={{ gridColumn: "auto" }}>
            <header className="integ-head" style={{ background: "var(--pink)" }}>
              <span className="dots">
                <i /><i /><i />
              </span>
              <span className="title">scope ไม่ครบ</span>
            </header>
            <div className="integ-body">
              <p className="thai-body" style={{ fontSize: "14.5px" }}>
                ลืม <Code>pages_manage_posts</Code> = โพสต์ไม่ได้. ลืม{" "}
                <Code>pages_manage_engagement</Code> = comment/react ไม่ได้
              </p>
            </div>
          </article>
          <article className="integ-card" style={{ gridColumn: "auto" }}>
            <header className="integ-head" style={{ background: "var(--pink)" }}>
              <span className="dots">
                <i /><i /><i />
              </span>
              <span className="title">password change = revoke</span>
            </header>
            <div className="integ-body">
              <p className="thai-body" style={{ fontSize: "14.5px" }}>
                ถ้าเปลี่ยนรหัส FB ของ admin token จะ revoke ทันที. ต้องเริ่มจาก step 1
                ใหม่ — ดังนั้นใช้ account แยกที่ไม่ได้ใช้ login ทั่วไปจะปลอดภัยกว่า
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── NEXT ──────────────────────────────────────────────────────── */}
      <section>
        <div
          style={{
            border: "var(--border)",
            borderRadius: "var(--r-card)",
            background: "linear-gradient(135deg,var(--mint),var(--sakura))",
            padding: "32px",
            boxShadow: "var(--shadow-hard)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <i
            className="spark"
            style={{ top: "14px", right: "24px", fontSize: "28px", color: "var(--pink-deep)" }}
          >
            ✦
          </i>
          <div
            className="mono"
            style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)" }}
          >
            Next up · HOWTO 002
          </div>
          <h2 style={{ marginTop: "6px" }}>tmux 4-pane Mint layout</h2>
          <p
            className="thai-body"
            style={{ maxWidth: "60ch", marginTop: "10px", fontSize: "15.5px" }}
          >
            วิธี set tmux ให้ main / ops / trio twins ทำงานคู่ขนาน + script{" "}
            <code
              style={{
                fontFamily: "var(--f-mono)",
                background: "rgba(255,255,255,.6)",
                padding: "1px 5px",
                borderRadius: "4px",
              }}
            >
              avatar-boot.sh
            </code>{" "}
            ที่ revive pane ทั้งหมดในคำสั่งเดียว
          </p>
          <Link href="/" className="sticker pink" style={{ marginTop: "18px", display: "inline-flex", transform: "none" }}>
            ← กลับหน้าแรก
          </Link>
        </div>
      </section>
    </>
  );
}
