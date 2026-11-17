/**
 * DAILY VIDEO TEMPLATE — the scheduled task rewrites the CONFIG block (and the scene body if the format needs it) each day.
 * Worked example below = format A "three rows" (2026-11-17, Store Profit OS, break-even ROAS).
 * Timeline (s): 0 hook · 2.5 bars grow · 5.5 results · 7.0 punch-in + badge · 8.0 debate bubble · 10.2 payoff · 11.8 end card · 14.5 end.
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

export const DAILY_SECONDS = 14.5;

// ---------------- CONFIG (edit per day) ----------------
const CONFIG = {
  showExampleLabel: true,
  hook: ['Running ads at', '[1.6 ROAS?]'],
  sub: '$39.99 sale − $15.86 costs = $24.13 left for ads (example)',
  marker: {value: 24.13, label: 'line = $24.13 left'},
  scaleMax: 30,
  rows: [
    {label: 'ROAS 1.4', value: 28.56, running: (v: number) => `Ads $${v.toFixed(2)}`, result: '−$4.43 /order', good: false, tag: 'loss per order'},
    {label: 'ROAS 1.6', value: 24.99, running: (v: number) => `Ads $${v.toFixed(2)}`, result: '−$0.86 /order', good: false, tag: 'loss per order'},
    {label: 'ROAS 2.0', value: 20.0, running: (v: number) => `Ads $${v.toFixed(2)}`, result: '+$4.13 /order', good: true, tag: 'profit per order'},
  ],
  focusRow: 1, badge: "LOOKS FINE. ISN'T.",
  captions: [
    {at: 2.5, text: 'Ads eat the [margin]'}, {at: 5.5, text: 'Two [lose] money'}, {at: 7.0, text: '[1.6] still loses'},
    {at: 8.0, text: '[Hot] take:'}, {at: 10.2, text: 'Know [your] number'},
  ],
  debate: "There's no [“good ROAS”].\nOnly yours.",
  payoff: {kicker: 'BREAK-EVEN ROAS', value: 1.66, decimals: 2, formula: '$39.99 ÷ $24.13 = 1.66', note: 'Below it, every order loses money.'},
  end: {line1: 'Know your break-even', line2: 'before you scale.', product: 'Store Profit OS'},
  t: {bars: 2.9, barGap: 0.9, results: 5.5, resultGap: 0.35, focus: 7.0, debate: 8.0, payoff: 10.2, end: 11.8},
};
// --------------------------------------------------------

const TOP = [640, 900, 1160]; const LANE_H = 220; const TRACK_X = 106; const TRACK_W = 828;

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const focus = t >= T.focus && t < T.debate; const zoom = focus ? 1 + 0.06 * easeOut((t - T.focus) / 0.35) : (t < 2.5 ? 1 + 0.04 * easeOut((t - 1.4) / 0.5) : 1);
  const out = t >= T.payoff ? easeOut((t - T.payoff) / 0.4) : 0;
  const lanes3d: Lane3D[] = CONFIG.rows.map((r, i) => ({y: TOP[i] + LANE_H - 26 - 18, fromX: TRACK_X, maxW: TRACK_W, value: r.value, scaleMax: CONFIG.scaleMax,
    startS: T.bars + i * T.barGap, resultS: T.results + i * T.resultGap, good: r.good}));
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: focus ? '540px 700px' : '540px 900px'}}>
        {CONFIG.showExampleLabel && <ExampleLabel dim={t >= T.debate && t < T.payoff} />}
        <Hook lines={CONFIG.hook} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />
        <div style={{position: 'absolute', left: 70, top: 470, width: 900, fontSize: 40, fontWeight: 600, color: '#b9b0aa', zIndex: 20,
          opacity: t >= 2.6 && t < T.results ? clamp((t - 2.6) / 0.2) : 0}}>{CONFIG.sub}</div>
        {CONFIG.rows.map((r, i) => {
          const st = T.bars + i * T.barGap, rt = T.results + i * T.resultGap, p = easeOut((t - st) / 0.7), done = t >= rt;
          const shake = done && !r.good ? Math.sin((t - rt) * 60) * 10 * (1 - clamp((t - rt) / 0.35)) : 0;
          const dim = focus && i !== CONFIG.focusRow ? 0.35 : 1;
          return (
            <div key={i} style={{position: 'absolute', left: 70, top: TOP[i], width: 900, height: LANE_H, borderRadius: 28, zIndex: 5,
              background: done ? (r.good ? '#101a13' : '#1f1112') : C.panel, border: `3px solid ${done ? (r.good ? C.green : C.red) : C.line}`,
              boxShadow: done && r.good ? `0 0 ${40 + 20 * Math.sin(t * 6)}px rgba(94,227,143,.45)` : 'none',
              opacity: (1 - out) * dim, transform: `translateX(${shake}px) translateY(${out * 120}px)`}}>
              <div style={{position: 'absolute', left: 36, top: 26, fontSize: 58, fontWeight: 900, letterSpacing: -1}}>{r.label}</div>
              <div style={{position: 'absolute', right: 36, top: 30, fontSize: 52, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                color: done ? (r.good ? C.green : C.red) : C.white}}>{t < st ? '' : done ? r.result : r.running(r.value * p)}</div>
              <div style={{position: 'absolute', left: 36, top: 104, fontSize: 30, fontWeight: 700, color: C.muted}}>{done ? r.tag : t >= st ? CONFIG.marker.label : 'ads per order'}</div>
              <div style={{position: 'absolute', left: 36, right: 36, bottom: 26, height: 36, borderRadius: 18, background: '#262120'}}>
                <div style={{position: 'absolute', left: (CONFIG.marker.value / CONFIG.scaleMax) * TRACK_W, top: -10, bottom: -10, width: 5, background: C.white, borderRadius: 3, zIndex: 2}} />
              </div>
            </div>
          );
        })}
        <Canvas3D zIndex={10} opacity={1 - out}>
          <Drifters />
          <Bars3D lanes={lanes3d} />
        </Canvas3D>
        {focus && t >= T.focus + 0.15 && (
          <div style={{position: 'absolute', left: 300, top: 1130, zIndex: 30, fontSize: 40, fontWeight: 900, background: C.red, padding: '14px 24px', borderRadius: 16,
            transform: `rotate(-4deg) scale(${backOut((t - T.focus - 0.15) / 0.25)})`}}>{CONFIG.badge}</div>
        )}
        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.payoff} />
        {t >= T.payoff + 0.1 && t < T.end && (<>
          <Canvas3D zIndex={25}><PayoffRing cx={540} cy={900} fromS={T.payoff + 0.1} toS={T.end} r={300} /></Canvas3D>
          <div style={{position: 'absolute', left: 70, top: 620, width: 900, height: 640, borderRadius: 36, background: 'rgba(16,26,19,.55)', border: `4px solid ${C.green}`,
            boxShadow: '0 0 80px rgba(94,227,143,.35)', textAlign: 'center', paddingTop: 60, zIndex: 30, opacity: clamp((t - T.payoff - 0.1) / 0.2),
            transform: `scale(${0.9 + 0.1 * backOut((t - T.payoff - 0.1) / 0.3)})`}}>
            <div style={{fontSize: 44, fontWeight: 800, letterSpacing: 4, color: C.green}}>{CONFIG.payoff.kicker}</div>
            <div style={{fontSize: 300, fontWeight: 900, letterSpacing: -10, lineHeight: 1, marginTop: 10, fontVariantNumeric: 'tabular-nums'}}>
              {(CONFIG.payoff.value * easeOut((t - T.payoff - 0.2) / 0.6)).toFixed(CONFIG.payoff.decimals)}</div>
            <div style={{fontSize: 44, fontWeight: 700, color: '#cfc7c1', marginTop: 26}}>{CONFIG.payoff.formula}</div>
            <div style={{fontSize: 40, fontWeight: 700, color: C.muted, marginTop: 16}}>{CONFIG.payoff.note}</div>
          </div>
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};
