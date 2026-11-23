/**
 * DAILY VIDEO — 2026-11-23 · format A (three rows) · Ecom Operating System.
 * Idea: same product (example: 10 sold a day, supplier takes 18 days), three ways to decide when to reorder.
 *       Reordering at 0 or on gut feel = days sold out; the weekly stock alert flags it while days-left > lead time.
 * Timeline (s): 0 hook + units-left counter ticking down · 1.3 SOLD OUT stamp · 2.6 lanes · 2.9 bars grow (3D) · 5.4 results
 *               · 6.8 punch-in + LEAD TIME badge · 8.2 debate bubble · 10.4 payoff (14 days left, 3D ring) · 12.6 end card · 15.0 end.
 */
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from './brand';
import {Hook} from './components/Hook';
import {BeatCaption} from './components/BeatCaption';
import {CommentBubble} from './components/CommentBubble';
import {EndCard} from './components/EndCard';
import {ExampleLabel} from './components/ExampleLabel';
import {Canvas3D, Bars3D, Drifters, PayoffRing, type Lane3D} from './components/Lanes3D';
import {backOut, clamp, easeOut} from './components/anim';

export const DAILY_SECONDS = 15;

// ---------------- CONFIG (edit per day) ----------------
const CONFIG = {
  showExampleLabel: true,
  hook: ['Store owners:', 'when do you', '[reorder?]'],
  counter: {from: 23, to: 0, endS: 1.2, label: 'units left · bestseller'},
  stamp: {at: 1.3, text: 'SOLD OUT'},
  sub: 'When to reorder · 10 sold a day · 18-day supplier (example)',
  scaleMax: 30,
  rows: [
    {label: 'AT 0 UNITS', value: 12, running: (p: number) => `${Math.round(12 * p)}/30 days`, result: '✗ 18 days out', good: false, tag: 'waited out the full 18-day lead time'},
    {label: 'GUT FEEL', value: 24, running: (p: number) => `${Math.round(24 * p)}/30 days`, result: '✗ 6 days out', good: false, tag: '“still looks like plenty” · it wasn’t'},
    {label: 'STOCK ALERT', value: 30, running: (p: number) => `${Math.round(30 * p)}/30 days`, result: '✓ 0 days out', good: true, tag: 'flagged while 18+ days were left'},
  ],
  trackNote: 'days in stock, next 30',
  focusRow: 0, badge: 'LEAD TIME: 18 DAYS',
  captions: [
    {at: 2.5, text: 'Same [product]'}, {at: 5.4, text: 'Two ran [out]'}, {at: 6.8, text: 'Lead time [bites]'},
    {at: 8.2, text: '[Hot] take:'}, {at: 10.4, text: 'The [rule]'},
  ],
  debate: '“Sold out” isn’t a flex.\n[It’s orders you lost.]',
  payoff: {kicker: 'DAYS OF STOCK LEFT', value: 14, prefix: '', suffix: ' days', formula: '140 units ÷ 10 sold a day = 14 days', note: 'supplier takes 18 → reorder now'},
  end: {line1: 'Reorder before', line2: 'it says sold out.', product: 'Ecom Operating System', pillSize: 40},
  t: {bars: 2.9, barGap: 0.8, results: 5.4, resultGap: 0.35, focus: 6.8, debate: 8.2, payoff: 10.4, end: 12.6},
};
// --------------------------------------------------------

const TOP = [640, 900, 1160]; const LANE_H = 220; const TRACK_X = 106; const TRACK_W = 828;

/** Hook visual: big units-left counter ticking to 0 (readable from frame 1), then a red SOLD OUT stamp slams on. */
const StockCounter: React.FC<{t: number}> = ({t}) => {
  const out = clamp((t - 2.2) / 0.3); if (out >= 1) return null;
  const c = CONFIG.counter; const n = Math.max(c.to, Math.round(c.from - (c.from - c.to) * clamp(t / c.endS)));
  const st = CONFIG.stamp; const sp = t >= st.at ? backOut((t - st.at) / 0.25) : 0;
  const low = n <= 10; const tick = Math.sin(t * 40) * (low && n > 0 ? 6 : 0);
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 110, top: 600, width: 860, height: 520, borderRadius: 40, background: '#1c1918', border: `4px solid ${low ? C.red : C.line}`,
        boxShadow: low ? '0 0 70px rgba(229,56,59,.35)' : '0 20px 40px rgba(0,0,0,.5)', textAlign: 'center'}}>
        <div style={{position: 'absolute', left: 50, top: 50, width: 120, height: 100, borderRadius: 14, background: '#b98a5e', transform: `rotate(${tick * 0.5}deg)`}}>
          <div style={{position: 'absolute', left: 50, top: 0, width: 20, height: 100, background: '#8f6743'}} />
        </div>
        <div style={{position: 'absolute', right: 50, top: 70, fontSize: 34, fontWeight: 800, color: low ? C.red : C.muted, letterSpacing: 2}}>{low ? 'LOW STOCK' : 'IN STOCK'}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, fontSize: 260, fontWeight: 900, letterSpacing: -10, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
          color: low ? C.red : C.white, transform: `translateX(${tick}px)`}}>{n}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 430, fontSize: 40, fontWeight: 700, color: '#cfc7c1'}}>{c.label}</div>
      </div>
      {t >= st.at && (
        <div style={{position: 'absolute', left: 180, top: 760, zIndex: 25, fontSize: 150, fontWeight: 900, letterSpacing: -4, color: C.red, whiteSpace: 'nowrap',
          border: `12px solid ${C.red}`, borderRadius: 30, padding: '6px 40px', background: 'rgba(10,9,9,.86)',
          transform: `rotate(-9deg) scale(${2.2 - 1.2 * sp})`, opacity: clamp((t - st.at) / 0.08), boxShadow: '0 0 80px rgba(229,56,59,.45)'}}>{st.text}</div>
      )}
    </div>
  );
};

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const focus = t >= T.focus && t < T.debate;
  const zoom = focus ? 1 + 0.07 * easeOut((t - T.focus) / 0.35) : (t < 2.5 ? 1 + 0.05 * easeOut((t - CONFIG.stamp.at) / 0.4) : 1);
  const out = t >= T.payoff ? easeOut((t - T.payoff) / 0.4) : 0;
  const lanesIn = t >= 2.6;
  const lanes3d: Lane3D[] = CONFIG.rows.map((r, i) => ({y: TOP[i] + LANE_H - 26 - 18, fromX: TRACK_X, maxW: TRACK_W, value: r.value, scaleMax: CONFIG.scaleMax,
    startS: T.bars + i * T.barGap, resultS: T.results + i * T.resultGap, good: r.good}));
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: focus ? '540px 700px' : '540px 800px'}}>
        {CONFIG.showExampleLabel && <ExampleLabel dim={t >= T.debate && t < T.payoff} />}
        <Hook lines={CONFIG.hook} />
        <StockCounter t={t} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />
        <div style={{position: 'absolute', left: 70, top: 470, width: 900, fontSize: 40, fontWeight: 600, color: '#b9b0aa', zIndex: 20,
          opacity: t >= 2.6 && t < T.results ? clamp((t - 2.6) / 0.2) : 0}}>{CONFIG.sub}</div>
        {lanesIn && CONFIG.rows.map((r, i) => {
          const inK = backOut((t - 2.6 - i * 0.1) / 0.35);
          const st = T.bars + i * T.barGap, rt = T.results + i * T.resultGap, p = easeOut((t - st) / 0.7), done = t >= rt;
          const shake = done && !r.good ? Math.sin((t - rt) * 60) * 10 * (1 - clamp((t - rt) / 0.35)) : 0;
          const dim = focus && i !== CONFIG.focusRow ? 0.35 : 1;
          return (
            <div key={i} style={{position: 'absolute', left: 70, top: TOP[i], width: 900, height: LANE_H, borderRadius: 28, zIndex: 5,
              background: done ? (r.good ? '#101a13' : '#1f1112') : C.panel, border: `3px solid ${done ? (r.good ? C.green : C.red) : C.line}`,
              boxShadow: done && r.good ? `0 0 ${40 + 20 * Math.sin(t * 6)}px rgba(94,227,143,.45)` : 'none',
              opacity: (1 - out) * dim * clamp((t - 2.6 - i * 0.1) / 0.15), transform: `translateX(${shake + (1 - inK) * 160}px) translateY(${out * 120}px)`}}>
              <div style={{position: 'absolute', left: 36, top: 30, fontSize: 48, fontWeight: 900, letterSpacing: -1}}>{r.label}</div>
              <div style={{position: 'absolute', right: 36, top: 26, fontSize: 52, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                color: done ? (r.good ? C.green : C.red) : C.white}}>{t < st ? '' : done ? r.result : r.running(p)}</div>
              <div style={{position: 'absolute', left: 36, top: 100, fontSize: 32, fontWeight: 700, color: done ? '#cfc7c1' : C.muted}}>{done ? r.tag : CONFIG.trackNote}</div>
              <div style={{position: 'absolute', left: 36, right: 36, bottom: 26, height: 36, borderRadius: 18, background: '#262120'}} />
            </div>
          );
        })}
        <Canvas3D zIndex={10} opacity={1 - out}>
          <Drifters />
          <Bars3D lanes={lanes3d.filter((l) => t >= l.startS)} />
        </Canvas3D>
        {focus && t >= T.focus + 0.15 && (
          <div style={{position: 'absolute', left: 430, top: 600, zIndex: 30, fontSize: 44, fontWeight: 900, background: C.red, padding: '14px 26px', borderRadius: 16,
            transform: `rotate(-4deg) scale(${backOut((t - T.focus - 0.15) / 0.25)})`, boxShadow: '0 0 50px rgba(229,56,59,.5)'}}>{CONFIG.badge}</div>
        )}
        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.payoff} />
        {t >= T.payoff + 0.1 && t < T.end && (<>
          <Canvas3D zIndex={25}><PayoffRing cx={540} cy={880} fromS={T.payoff + 0.1} toS={T.end} r={360} /></Canvas3D>
          <div style={{position: 'absolute', left: 70, top: 560, width: 900, height: 660, borderRadius: 36, background: 'rgba(16,26,19,.86)', border: `4px solid ${C.green}`,
            boxShadow: '0 0 80px rgba(94,227,143,.35)', textAlign: 'center', paddingTop: 56, zIndex: 30, opacity: clamp((t - T.payoff - 0.1) / 0.2),
            transform: `scale(${0.9 + 0.1 * backOut((t - T.payoff - 0.1) / 0.3)})`}}>
            <div style={{fontSize: 42, fontWeight: 800, letterSpacing: 4, color: C.green}}>{CONFIG.payoff.kicker}</div>
            <div style={{fontSize: 280, fontWeight: 900, letterSpacing: -10, lineHeight: 1, marginTop: 10, fontVariantNumeric: 'tabular-nums'}}>
              {CONFIG.payoff.prefix}{Math.round(CONFIG.payoff.value * easeOut((t - T.payoff - 0.2) / 0.6))}<span style={{fontSize: 120, letterSpacing: -4}}>{CONFIG.payoff.suffix}</span></div>
            <div style={{fontSize: 36, fontWeight: 700, color: '#cfc7c1', marginTop: 26}}>{CONFIG.payoff.formula}</div>
            {t >= T.payoff + 1.0 && (
              <div style={{display: 'inline-block', marginTop: 30, background: '#0a0909', border: `3px solid ${C.green}`, borderRadius: 999, padding: '14px 34px',
                fontSize: 40, fontWeight: 800, color: C.green, transform: `scale(${backOut((t - T.payoff - 1.0) / 0.3)})`}}>{CONFIG.payoff.note}</div>
            )}
          </div>
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};
