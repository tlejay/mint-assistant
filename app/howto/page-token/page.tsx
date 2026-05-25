import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to get a Long-lived Facebook Page Access Token",
  description:
    "Step-by-step guide (Thai + English) to create a Facebook app and obtain a never-expiring Page Access Token for automating posts on your own Page.",
};

type Step = {
  n: number;
  title: string;
  thai: string;
  english?: string;
  image?: { src: string; alt: string };
  note?: string;
};

const steps: Step[] = [
  {
    n: 1,
    title: "Open developers.facebook.com/apps",
    thai: "เข้า https://developers.facebook.com/apps ด้วย account Facebook ที่เป็น admin ของ Page ที่จะให้ token ดูแล แล้วกดปุ่ม Create App มุมขวาบน",
    english: "Sign in with the Facebook account that admins the Page. Click Create App.",
    image: { src: "/howto/page-token/01-my-apps.png", alt: "My Apps page" },
  },
  {
    n: 2,
    title: "Create App modal",
    thai: "กรอกชื่อแอป (เช่น 'Mint AI Assistant') กับ contact email แล้วกด Next",
    english: "Enter an app name and your contact email, then Next.",
    image: { src: "/howto/page-token/02-create-app.png", alt: "Create App modal" },
  },
  {
    n: 3,
    title: "Pick a use case = Manage everything on your Page",
    thai: "หน้า Use cases เลือก 'Manage everything on your Page' (จะ unlock Pages API ให้อัตโนมัติ ไม่ต้องไปขอ permission ทีละตัว)",
    english: "Choose 'Manage everything on your Page'. This bundles the Pages API permissions you need.",
    image: { src: "/howto/page-token/04-use-cases.png", alt: "Use case selection" },
  },
  {
    n: 4,
    title: "Skip business portfolio + finalize",
    thai: "หน้า Business จะถามว่า associate app กับ Business Portfolio ไหม กดข้ามได้ (ผูกทีหลังก็ได้) แล้วกด Create app — Facebook จะให้กรอก password ซ้ำเพื่อยืนยันตัวตน",
    english: "Skip the Business Portfolio step (you can attach one later) and click Create app. Facebook may ask you to re-enter your password.",
    image: { src: "/howto/page-token/03-app-name.png", alt: "App details filled" },
  },
  {
    n: 5,
    title: "Land on the App Dashboard",
    thai: "เมื่อสร้างสำเร็จจะเข้าสู่ App Dashboard จดเลข App ID ไว้ (จะใช้ตอนแลก token)",
    english: "After creation you land on the App Dashboard. Note the App ID.",
    image: { src: "/howto/page-token/06-app-dashboard.png", alt: "App Dashboard" },
  },
  {
    n: 6,
    title: "Open Use cases → Customize → add 4 page permissions",
    thai: "ไปที่ Use cases > 'Manage everything on your Page' > Customize. ในตาราง Permissions ให้กด Add ทีละบรรทัด: pages_show_list, pages_manage_posts, pages_read_engagement, pages_manage_metadata จนทุกตัวขึ้น 'Ready for testing'",
    english:
      "In Use cases → Manage Pages → Customize. Hit Add next to each: pages_show_list, pages_manage_posts, pages_read_engagement, pages_manage_metadata. They should switch to 'Ready for testing'.",
    image: { src: "/howto/page-token/07-customize-perms.png", alt: "Customize use case page" },
  },
  {
    n: 7,
    title: "Verify all four perms = Ready for testing",
    thai: "เช็คให้แน่ใจว่าทุกตัวขึ้น '0 Ready for testing' (ตัว public_profile กับ business_management จะ default มาให้อยู่แล้ว)",
    english: "Confirm all four permissions show 'Ready for testing' status.",
    image: { src: "/howto/page-token/08-perms-ready.png", alt: "Permissions added state" },
  },
  {
    n: 8,
    title: "Open Graph API Explorer",
    thai: "ไปที่ Tools > Graph API Explorer (https://developers.facebook.com/tools/explorer/) เลือก Meta App = ชื่อแอปที่เพิ่งสร้าง",
    english: "Open Tools → Graph API Explorer. Select your new app under Meta App.",
    image: { src: "/howto/page-token/09-graph-explorer.png", alt: "Graph API Explorer" },
  },
  {
    n: 9,
    title: "Generate Access Token + approve OAuth",
    thai: "กดปุ่ม Generate Access Token. Facebook จะเปิด popup ขออนุญาต: กด Continue as <ชื่อคุณ>",
    english: "Click Generate Access Token. Facebook opens an OAuth popup. Click Continue as <your name>.",
    image: { src: "/howto/page-token/10-oauth-approve.png", alt: "OAuth approve dialog" },
  },
  {
    n: 10,
    title: "Pick only the Page you want automated",
    thai: "หน้า 'Choose the Pages you want ... to access' เลือกเฉพาะ Page ที่จะให้ token ดูแล (ติ๊กตัวเดียวพอ ไม่ต้อง select all) แล้วกด Continue",
    english: "On the page selector, tick ONLY the Page you want to automate, then Continue.",
    image: { src: "/howto/page-token/11-pages-selector.png", alt: "Pages selector" },
  },
  {
    n: 11,
    title: "Review access request + Save",
    thai: "หน้าสรุปจะแสดงว่าแอปจะเข้าถึงอะไรได้บ้าง กด Save แล้ว Got it",
    english: "Review the access request and click Save → Got it.",
    image: { src: "/howto/page-token/12-review-access.png", alt: "Review access request" },
  },
  {
    n: 12,
    title: "Connected → get short-lived user token",
    thai: "Popup ปิด แอปกลับสู่ Graph Explorer ช่อง Access Token จะเด้งโทเคน user token สั้น ๆ (ใช้ได้ ~1 ชั่วโมง) มาให้",
    english:
      "After approval the dialog closes and Graph Explorer fills the Access Token field with a short-lived user token (~1 hour TTL).",
    image: { src: "/howto/page-token/13-connected.png", alt: "Connection successful" },
  },
  {
    n: 13,
    title: "Copy the App Secret",
    thai: "เปิดอีก tab ไป App settings > Basic แล้วกด Show ที่ช่อง App secret (Facebook อาจขอ password ซ้ำ). คัดลอกเก็บไว้ — อย่าเผยแพร่ตัวนี้เด็ดขาด",
    english: "Open App settings → Basic, click Show next to App secret, and copy it. Never share it.",
    image: { src: "/howto/page-token/14-app-secret.png", alt: "App secret revealed" },
    note: "ความลับ — เก็บใส่ Keychain/secret manager ของคุณ ห้าม commit ลง git",
  },
  {
    n: 14,
    title: "Exchange short → long-lived USER token (60 days)",
    thai: "รัน curl นี้ใน terminal เพื่อแลก user token สั้น ๆ ให้กลายเป็น long-lived user token (อายุ ~60 วัน)",
    english:
      "Exchange the short-lived user token for a long-lived one (60 days) via the fb_exchange_token grant.",
  },
  {
    n: 15,
    title: "Trade up to never-expiring PAGE token",
    thai: "เอา long-lived user token ที่ได้ ไปเรียก /me/accounts จะคืน access_token ของแต่ละ Page ที่คุณ admin token Page ตัวนี้จะ ไม่มีวันหมดอายุ ตราบใดที่คุณยังเป็น admin ของ Page",
    english:
      "Call /me/accounts with the long-lived user token. Each entry's access_token is the Page token. Those Page tokens NEVER expire as long as you remain an admin.",
  },
];

const curl1 = `curl -G "https://graph.facebook.com/v25.0/oauth/access_token" \\
  --data-urlencode "grant_type=fb_exchange_token" \\
  --data-urlencode "client_id=YOUR_APP_ID" \\
  --data-urlencode "client_secret=YOUR_APP_SECRET" \\
  --data-urlencode "fb_exchange_token=YOUR_SHORT_LIVED_USER_TOKEN"`;

const curl2 = `curl "https://graph.facebook.com/v25.0/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN"`;

const curlVerify = `curl "https://graph.facebook.com/v25.0/debug_token?input_token=PAGE_TOKEN&access_token=APP_ID|APP_SECRET"`;

const samplePost = `curl -X POST "https://graph.facebook.com/v25.0/me/feed" \\
  -d "message=Hello world from my Page" \\
  -d "access_token=PAGE_TOKEN"`;

export default function PageTokenHowTo() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #fff5fa 0%, #f3edff 45%, #eef9ff 100%)",
      }}
    >
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-pink-500">
            HOW TO
          </p>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            How to get a Long-lived Facebook{" "}
            <span className="text-pink-600">Page Access Token</span>
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-600">
            Step-by-step วิธีสร้าง Facebook App ใหม่และดึง{" "}
            <strong>Page Access Token ที่ไม่มีวันหมดอายุ</strong>{" "}
            มาใช้ automate การโพสต์บน Page ของตัวเอง.
            ใช้กระบวนการนี้ครั้งเดียวก็จบ ไม่ต้อง re-login อีกตราบใดที่คุณยังเป็น admin
            ของ Page.
          </p>
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-slate-600 ring-1 ring-pink-200">
            ⏱ ใช้เวลา ~15 นาที · ฟรี · ไม่ต้อง App Review
          </div>
        </header>

        <section className="mb-10 rounded-2xl bg-white/60 p-6 ring-1 ring-pink-200 backdrop-blur">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Token นี้คืออะไร แล้วทำไมต้องใช้
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>
              <strong>User token</strong> ปกติของ Facebook อายุสั้นมาก (1-2 ชั่วโมง)
              ต่อให้แลกเป็น long-lived ก็แค่ <strong>60 วัน</strong> หลังจากนั้นต้อง login ใหม่
            </li>
            <li>
              <strong>Page token</strong> ที่ได้จาก <code>/me/accounts</code>{" "}
              ด้วย <em>long-lived user token</em> จะ{" "}
              <strong>ไม่มีวันหมดอายุ</strong> ตราบใดที่คุณยังเป็น admin ของ Page
              ตัวเดียวกัน (Facebook ออกแบบไว้สำหรับ automation/server-to-server โดยเฉพาะ)
            </li>
            <li>
              เอาไว้ใช้กับ Graph API endpoint อย่าง{" "}
              <code>POST /me/feed</code>,{" "}
              <code>POST /me/photos</code>,{" "}
              <code>GET /me/insights</code>{" "}
              ฯลฯ
            </li>
          </ul>
        </section>

        <ol className="space-y-12">
          {steps.map((step) => (
            <li key={step.n} id={`step-${step.n}`} className="scroll-mt-20">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500 text-base font-bold text-white shadow-sm">
                  {step.n}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-700">
                    {step.thai}
                  </p>
                  {step.english && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      <span className="font-medium text-slate-400">EN · </span>
                      {step.english}
                    </p>
                  )}
                  {step.note && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
                      ⚠ {step.note}
                    </p>
                  )}
                  {step.image && (
                    <figure className="mt-5 overflow-hidden rounded-xl ring-1 ring-slate-200">
                      <Image
                        src={step.image.src}
                        alt={step.image.alt}
                        width={2200}
                        height={1768}
                        className="h-auto w-full"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </figure>
                  )}
                  {step.n === 14 && (
                    <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-pink-100">
                      <code>{curl1}</code>
                    </pre>
                  )}
                  {step.n === 15 && (
                    <>
                      <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-pink-100">
                        <code>{curl2}</code>
                      </pre>
                      <p className="mt-4 text-sm leading-6 text-slate-700">
                        Response จะมี array <code>data[]</code> แต่ละตัวคือ Page
                        ที่คุณเป็น admin field <code>access_token</code>{" "}
                        ของ Page นั้นแหละคือ{" "}
                        <strong>Long-lived Page Access Token</strong> ที่ต้องการ
                      </p>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-16 rounded-2xl bg-white/60 p-6 ring-1 ring-pink-200 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900">
            ตรวจสอบว่า Token ไม่มีวันหมดอายุจริง
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            เรียก <code>debug_token</code> endpoint แล้วดูค่า{" "}
            <code>expires_at</code> ต้องเป็น <strong>0</strong> (แปลว่า never).
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-emerald-100">
            <code>{curlVerify}</code>
          </pre>

          <h3 className="mt-8 text-base font-semibold text-slate-900">
            ลองโพสต์
          </h3>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-emerald-100">
            <code>{samplePost}</code>
          </pre>
        </section>

        <section className="mt-12 rounded-2xl bg-rose-50/70 p-6 ring-1 ring-rose-200">
          <h2 className="text-lg font-semibold text-rose-900">
            Token จะตายเมื่อไหร่
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-rose-900">
            <li>คุณถูกถอดสิทธิ์ admin ของ Page</li>
            <li>
              คุณเข้าไป revoke แอปที่{" "}
              <a
                href="https://www.facebook.com/settings?tab=business_tools"
                className="underline"
              >
                Settings → Business Tools
              </a>
            </li>
            <li>เปลี่ยนรหัสผ่าน Facebook (บางเคส)</li>
            <li>Facebook ยึดสิทธิ์แอปเพราะละเมิด policy</li>
          </ul>
          <p className="mt-4 text-sm leading-6 text-rose-900">
            ถ้าโดนกรณีใดกรณีหนึ่ง ให้กลับมาเดิน Step 8 ถึง 15 ใหม่ (ไม่ต้องสร้างแอปใหม่)
          </p>
        </section>

        <footer className="mt-16 border-t border-pink-200 pt-8 text-center text-sm text-slate-500">
          <p>
            Made with 🌸 by{" "}
            <Link href="/" className="font-medium text-pink-600 hover:underline">
              Mint AI Assistant
            </Link>
            . Captured live during a real flow on 2026-05-25.
          </p>
        </footer>
      </div>
    </div>
  );
}
