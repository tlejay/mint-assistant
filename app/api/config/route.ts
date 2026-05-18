import { NextRequest, NextResponse } from "next/server";
import { listConfig, updateConfig } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WARROOM_PIN = "1235";

function pinOk(req: NextRequest): boolean {
  const pin = req.headers.get("x-warroom-pin");
  return pin === WARROOM_PIN;
}

export async function GET(req: NextRequest) {
  if (!pinOk(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  try {
    const entries = await listConfig();
    return NextResponse.json({ ok: true, entries });
  } catch (e) {
    console.error("[/api/config][GET] failed", e);
    return NextResponse.json(
      { ok: false, error: "list_failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!pinOk(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "missing_key" },
      { status: 400 },
    );
  }

  let body: { value?: unknown; updated_by?: string };
  try {
    body = (await req.json()) as { value?: unknown; updated_by?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  if (!("value" in body)) {
    return NextResponse.json(
      { ok: false, error: "missing_value" },
      { status: 400 },
    );
  }

  try {
    const row = await updateConfig(key, body.value, body.updated_by ?? "warroom");
    if (!row) {
      return NextResponse.json(
        { ok: false, error: "key_not_found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, entry: row });
  } catch (e) {
    console.error("[/api/config][PATCH] failed", e);
    return NextResponse.json(
      { ok: false, error: "update_failed" },
      { status: 500 },
    );
  }
}
