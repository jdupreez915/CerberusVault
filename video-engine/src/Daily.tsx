/**
 * DAILY VIDEO — 2026-11-20 · format A (three rows) · Ecom Command Center (Store Profit OS + Ecom Operating System).
 * Idea: same $4,200 week (example), three owners check three different numbers. Sales and ROAS alone leave you guessing;
 *       profit + cash tells you what the week actually left (+$310, 11 weeks of runway).
 * Timeline (s): 0 hook + order pings + PROFIT? stamp · 2.6 lanes · 2.9 bars grow (3D) · 5.4 results · 6.8 punch-in + badge
 *               · 8.2 debate bubble · 10.4 payoff (+$310, 3D ring) · 12.6 end card · 15.0 end.
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
  hook: ['$4,200 in sales.', 'Profit: [???]'],
  pings: [
    {at: -1, text: 'New order · $39.99'}, {at: -1, text: 'New order · $64.98'},
    {at: 0.4, text: 'New order · $39.99'}, {at: 0.8, text: 'New order · $119.97'},
  ],
  stamp: {at: 1.3, text: 'PROFIT?'},
  sub: 'Same $4,200 week · 3 owners, 3 checks (example)',
  scaleMax: 100,
  rows: [
    {label: 'CHECKS SALES', value: 30, running: (p: number) => `$${Math.round(4200 * p).toLocaleString('en-US')}`, result: '✗ profit: ?', good: false, tag: 'feels great · tells you nothing'},
    {label: 'CHECKS ROAS', value: 55, running: (p: number) => `${(2.1 * p).toFixed(1)} ROAS`, result: '✗ good or bad?', good: false, tag: 'no break-even to compare it to'},
    {label: 'CHECKS PROFIT + CASH', value: 100, running: (p: number) => `+$${Math.round(310 * p)}`, result: '✓ +$310', good: true, tag: 'kept $310 · 11 weeks of cash'},
  ],
  trackNote: 'how much it tells you',
  focusRow: 0, badge: 'SALES ≠ PROFIT',
  captions: [
    {at: 2.5, text: 'Same [$4,200] week'}, {at: 5.4, text: 'Two are [guessing]'}, {at: 6.8, text: 'Sales ≠ [profit]'},
    {at: 8.2, text: '[Hot] take:'}, {at: 10.4, text: 'The [real] number'},
  ],
  debate: 'Revenue screenshots are\n[vanity metrics].',
  payoff: {kicker: 'WHAT THE $4,200 LEFT', value: 310, prefix: '+$', formula: '$4,200 − $1,650 stock − $2,000 ads − $240 fees', note: 'and 11 weeks of cash runway'},
  end: {line1: 'Know what you kept,', line2: 'not just what you sold.', product: 'Ecom Command Center', pillSize: 44},
  t: {bars: 2.9, barGap: 0.8, results: 5.4, resultGap: 0.35, focus: 6.8, debate: 8.2, payoff: 10.4, end: 12.6},
};
// --------------------------------------------------------

const TOP = [640, 900, 1160]; const LANE_H = 220; const TRACK_X = 106; const TRACK_W = 828;

/** Hook visual: phone-style order notifications stacking up, then a red PROFIT? stamp slams on. */
const OrderPings: React.FC<{t: number}> = ({t}) => {
  const out = clamp((t - 2.2) / 0.3); if (out >= 1) return null;
  const st = CONFIG.stamp; const sp = t >= st.at ? backOut((t - st.at) / 0.25) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, opacity: 1 - out}}>
      {CONFIG.pings.map((p, i) => {
        if (t < p.at) return null;
        const k = p.at < 0 ? 1 : backOut((t - p.at) / 0.3);
        return (
          <div key={i} style={{position: 'absolute', left: 110, top: 520 + i * 150, width: 860, height: 120, borderRadius: 30, background: '#1c1918',
            border: `3px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px',
            transform: `translateY(${(1 - k) * -60}px) scale(${0.9 + 0.1 * k})`, opacity: clamp(k * 1.5), boxShadow: '0 20px 40px rgba(0,0,0,.5)'}}>
            <div style={{width: 72, height: 72, borderRadius: 18, background: C.green, color: C.bg, fontSize: 44, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>$</div>
            <div style={{fontSize: 46, fontWeight: 800}}>{p.text}</div>
            <div style={{marginLeft: 'auto', fontSize: 28, fontWeight: 700, color: C.muted}}>now</div>
          </div>
        );
      })}
      {t >= st.at && (
        <div style={{position: 'absolute', left: 250, top: 760, zIndex: 25, fontSize: 150, fontWeight: 900, letterSpacing: -4, color: C.red,
          border: `12px solid ${C.red}`, borderRadius: 30, padding: '6px 40px', background: 'rgba(10,9,9,.82)',
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
        <OrderPings t={t} />
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
              {CONFIG.payoff.prefix}{Math.round(CONFIG.payoff.value * easeOut((t - T.payoff - 0.2) / 0.6))}</div>
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
