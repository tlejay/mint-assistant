'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Density = 'compact' | 'regular' | 'comfy';
type Accent  = 'pink' | 'mint' | 'lemon' | 'lav';

interface TweakValues {
  density: Density;
  displayFont: string;
  accent: Accent;
  shadow: number;
  sparkles: boolean;
  showEN: boolean;
}

const DEFAULTS: TweakValues = {
  density:     'regular',
  displayFont: 'Mochiy Pop One',
  accent:      'pink',
  shadow:      6,
  sparkles:    true,
  showEN:      true,
};

const LS_KEY = 'mint-tweaks-v1';

// ── Accent palettes ───────────────────────────────────────────────────────────

const ACCENTS: Record<Accent, Record<string, string>> = {
  pink:  { pink: '#ff4d8d', pinkDeep: '#e63677', pinkSoft: '#ffaac4', sakura: '#ffd9e3', bg: '#fff3f7', bg2: '#ffe2ec' },
  mint:  { pink: '#2fbf99', pinkDeep: '#1d9c7c', pinkSoft: '#9eebd6', sakura: '#cff5e8', bg: '#f0fbf6', bg2: '#dff5ea' },
  lemon: { pink: '#e6a700', pinkDeep: '#b88400', pinkSoft: '#ffe488', sakura: '#fff09a', bg: '#fffbe9', bg2: '#fff3c4' },
  lav:   { pink: '#8a5af5', pinkDeep: '#6a3ed1', pinkSoft: '#d2bdff', sakura: '#e8defc', bg: '#f6f1ff', bg2: '#ebe1ff' },
};

// ── Apply tweaks to CSS variables on :root ─────────────────────────────────

function applyTweaks(t: TweakValues) {
  const r = document.documentElement;

  // density
  const dens = {
    compact: { pad: '44px', gap: '10px', baseFs: '15px'   },
    regular: { pad: '64px', gap: '14px', baseFs: '16.5px' },
    comfy:   { pad: '84px', gap: '18px', baseFs: '17.5px' },
  }[t.density];
  if (dens) {
    r.style.setProperty('--sec-pad',  dens.pad);
    r.style.setProperty('--grid-gap', dens.gap);
    document.body.style.fontSize = dens.baseFs;
  }

  // display font
  r.style.setProperty(
    '--f-display',
    `"${t.displayFont}", "IBM Plex Sans Thai Looped", system-ui, sans-serif`,
  );

  // accent palette
  const a = ACCENTS[t.accent] ?? ACCENTS.pink;
  r.style.setProperty('--pink',      a.pink);
  r.style.setProperty('--pink-deep', a.pinkDeep);
  r.style.setProperty('--pink-soft', a.pinkSoft);
  r.style.setProperty('--sakura',    a.sakura);
  r.style.setProperty('--bg',        a.bg);
  r.style.setProperty('--bg-2',      a.bg2);

  // sparkles
  document.querySelectorAll<HTMLElement>('.spark').forEach((el) => {
    el.style.display = t.sparkles ? '' : 'none';
  });

  // show / hide EN translations
  document.querySelectorAll<HTMLElement>('.trio-desc.en').forEach((el) => {
    el.style.display = t.showEN ? '' : 'none';
  });

  // shadow weight
  const s = Math.max(0, Math.min(12, t.shadow));
  r.style.setProperty('--shadow-hard',    `${s}px ${s}px 0 0 var(--ink)`);
  r.style.setProperty('--shadow-hard-sm', `${Math.max(1, s / 2)}px ${Math.max(1, s / 2)}px 0 0 var(--ink)`);
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadSaved(): Partial<TweakValues> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTweaks(t: TweakValues) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(t)); } catch { /* noop */ }
}

// ── Panel CSS (injected once as a <style> tag) ───────────────────────────────

const PANEL_CSS = `
.twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
  max-height:calc(100vh - 32px);display:flex;flex-direction:column;
  background:rgba(250,249,247,.92);color:#29261b;
  -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
  border:.5px solid rgba(255,255,255,.6);border-radius:14px;
  box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
  font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden;
  transition:opacity .18s,transform .18s cubic-bezier(.3,.7,.4,1)}
.twk-panel.twk-hidden{opacity:0;transform:scale(.94) translateY(8px);pointer-events:none}
.twk-hd{display:flex;align-items:center;justify-content:space-between;
  padding:10px 8px 10px 14px;cursor:move;user-select:none;border-bottom:.5px solid rgba(0,0,0,.07)}
.twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
.twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
  width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
.twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
.twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
  overflow-y:auto;overflow-x:hidden;min-height:0;
  scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
.twk-body::-webkit-scrollbar{width:8px}
.twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
  border:2px solid transparent;background-clip:content-box}
.twk-row{display:flex;flex-direction:column;gap:5px}
.twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
.twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
.twk-lbl>span:first-child{font-weight:500}
.twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}
.twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:rgba(41,38,27,.45);padding:10px 0 0}
.twk-sect:first-child{padding-top:0}
.twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
  border:.5px solid rgba(0,0,0,.1);border-radius:7px;
  background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
.twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
select.twk-field{padding-right:22px;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
  background-repeat:no-repeat;background-position:right 8px center}
.twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
  border-radius:999px;background:rgba(0,0,0,.12);outline:none}
.twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
  width:14px;height:14px;border-radius:50%;background:#fff;
  border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
.twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
  background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2)}
.twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
  background:rgba(0,0,0,.06);user-select:none}
.twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
  background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
  transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
.twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
  background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
  border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2}
.twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
  background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0;flex-shrink:0}
.twk-toggle[data-on="1"]{background:#34c759}
.twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
  background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s;display:block}
.twk-toggle[data-on="1"] i{transform:translateX(14px)}
.twk-fab{position:fixed;right:16px;bottom:16px;z-index:2147483645;
  width:36px;height:36px;border-radius:50%;border:0;
  background:rgba(255,255,255,.9);backdrop-filter:blur(8px);
  box-shadow:0 2px 8px rgba(0,0,0,.18);cursor:default;font-size:16px;
  display:flex;align-items:center;justify-content:center;
  transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
.twk-fab:hover{transform:scale(1.08);box-shadow:0 4px 14px rgba(0,0,0,.22)}
@media (prefers-reduced-motion:reduce){
  .twk-panel,.twk-panel.twk-hidden,.twk-fab,.twk-seg-thumb,.twk-toggle,.twk-toggle i{
    transition:none!important}
  .twk-fab-wrap{display:none!important}}
`;

// ── Sub-components ────────────────────────────────────────────────────────────

function Sect({ label }: { label: string }) {
  return <div className="twk-sect">{label}</div>;
}

function Row({ label, value, children, inline = false }: {
  label: string; value?: React.ReactNode; children: React.ReactNode; inline?: boolean;
}) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

function Slider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }: {
  label: string; value: number; min?: number; max?: number;
  step?: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <Row label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </Row>
  );
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={value}
              onClick={() => onChange(!value)}>
        <i />
      </button>
    </div>
  );
}

function SegRadio({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, options.indexOf(value));
  const n = options.length;
  return (
    <Row label={label}>
      <div ref={trackRef} role="radiogroup" className="twk-seg">
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={o === value}
                  onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </Row>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <Row label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Row>
  );
}

// ── Main TweaksPanel component ────────────────────────────────────────────────

export default function TweaksPanel() {
  const [open, setOpen]   = useState(false);
  const [t, setT]         = useState<TweakValues>(() => ({ ...DEFAULTS, ...loadSaved() }));
  const panelRef          = useRef<HTMLDivElement>(null);
  const offsetRef         = useRef({ x: 16, y: 16 });
  const PAD               = 16;

  // Apply tweaks whenever values change
  useEffect(() => {
    applyTweaks(t);
    saveTweaks(t);
  }, [t]);

  const set = useCallback(<K extends keyof TweakValues>(key: K, val: TweakValues[K]) => {
    setT((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Clamp panel to viewport
  const clamp = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    const maxX = Math.max(PAD, window.innerWidth  - el.offsetWidth  - PAD);
    const maxY = Math.max(PAD, window.innerHeight - el.offsetHeight - PAD);
    offsetRef.current = {
      x: Math.min(maxX, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxY, Math.max(PAD, offsetRef.current.y)),
    };
    el.style.right  = offsetRef.current.x + 'px';
    el.style.bottom = offsetRef.current.y + 'px';
  }, []);

  useEffect(() => {
    if (!open) return;
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [open, clamp]);

  // Drag-to-reposition
  const onDragStart = (e: React.MouseEvent) => {
    const el = panelRef.current;
    if (!el) return;
    const r   = el.getBoundingClientRect();
    const sx  = e.clientX, sy = e.clientY;
    const sr  = window.innerWidth  - r.right;
    const sb  = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      offsetRef.current = { x: sr - (ev.clientX - sx), y: sb - (ev.clientY - sy) };
      clamp();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',  up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
  };

  const DISPLAY_FONTS = ['Mochiy Pop One', 'Bricolage Grotesque', 'Rubik Mono One', 'Honk'];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PANEL_CSS }} />

      {/* FAB toggle button */}
      <div className="twk-fab-wrap">
        <button
          className="twk-fab"
          aria-label={open ? 'Close tweaks' : 'Open tweaks'}
          onClick={() => setOpen((o) => !o)}
          style={{ bottom: open ? `${offsetRef.current.y + (panelRef.current?.offsetHeight ?? 0) + 8}px` : '16px' }}
        >
          🎨
        </button>
      </div>

      {/* Panel */}
      <div
        ref={panelRef}
        className={`twk-panel${open ? '' : ' twk-hidden'}`}
        aria-hidden={!open}
        style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}
      >
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>Tweaks ✨</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="twk-body">
          <Sect label="Look & feel" />
          <SegRadio label="Density" value={t.density}
                    options={['compact', 'regular', 'comfy']}
                    onChange={(v) => set('density', v as Density)} />
          <SelectField label="Display font" value={t.displayFont}
                       options={DISPLAY_FONTS}
                       onChange={(v) => set('displayFont', v)} />
          <Slider label="Hard-shadow" value={t.shadow}
                  min={0} max={12} step={1} unit="px"
                  onChange={(v) => set('shadow', v)} />

          <Sect label="Palette" />
          <SegRadio label="Accent" value={t.accent}
                    options={['pink', 'mint', 'lemon', 'lav']}
                    onChange={(v) => set('accent', v as Accent)} />

          <Sect label="Vibe" />
          <Toggle label="Sparkles"            value={t.sparkles} onChange={(v) => set('sparkles', v)} />
          <Toggle label="Show EN translations" value={t.showEN}  onChange={(v) => set('showEN', v)} />
        </div>
      </div>
    </>
  );
}
