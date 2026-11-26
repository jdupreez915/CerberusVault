/**
 * DAILY VIDEO — 2026-11-26 · format A (three rows) · Supplier Sourcing System.
 * Idea: a $4.20 supplier quote isn't your unit cost. Same supplier, three ways to count cost (example figures):
 *       quote only $4.20 (✗ $2.44 missing), quote + shipping $5.55 (✗ $1.09 missing), full landed $6.64 (✓).
 *       Landed = 4.20 product + 1.35 shipping + 0.48 duty + 0.40 fees + 0.21 payment fee = $6.64 (+58% vs quote).
 * Timeline (s): 0 hook + quote card · 0.35 red slash · 1.2 "real cost?" tag · 2.6 lanes · 2.9 bars grow (3D) · 5.3 results
 *               · 6.8 punch-in + badge · 8.2 debate bubble · 10.4 payoff ($6.64, 3D ring) · 12.6 end card · 15.0 end.
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
  hook: ['That $4.20', 'unit cost?', '[Wrong.]'],
  quote: {label: 'SUPPLIER QUOTE', value: '$4.20', unit: '/ unit', slashAt: 0.1, tagAt: 1.2, tag: 'real cost: $?.??'},
  sub: 'Same supplier · cost per unit (example)',
  scaleMax: 6.64,
  rows: [
    {label: 'QUOTE ONLY', value: 4.20, running: (p: number) => `$${(4.20 * p).toFixed(2)}`, result: '✗ $2.44 short', good: false, tag: 'freight, duty and fees ignored'},
    {label: 'QUOTE + SHIPPING', value: 5.55, running: (p: number) => `$${(5.55 * p).toFixed(2)}`, result: '✗ $1.09 short', good: false, tag: 'duty, platform + payment fees ignored'},
    {label: 'FULL LANDED', value: 6.64, running: (p: number) => `$${(6.64 * p).toFixed(2)}`, result: '✓ $6.64 real', good: true, tag: 'product + ship + duty + fees + payment'},
  ],
  trackNote: 'cost per unit counted',
  focusRow: 2, badge: '+58% VS THE QUOTE',
  captions: [
    {at: 2.5, text: 'Same [supplier]'}, {at: 5.3, text: 'Two [guessed]'}, {at: 6.8, text: 'The [gap]'},
    {at: 8.2, text: '[Hot] take:'}, {at: 10.4, text: 'The [real] number'},
  ],
  debate: '“Free shipping” from a\nsupplier is just shipping\n[in the price.]',
  payoff: {kicker: 'LANDED COST PER UNIT', value: 6.64, prefix: '$', suffix: '', formula: '4.20 product + 1.35 shipping + 0.48 duty\n+ 0.40 fees + 0.21 payment fee', note: 'price from this, not the quote'},
  end: {line1: 'Landed cost first.', line2: 'Then set the price.', product: 'Supplier Sourcing System', pillSize: 38},
  t: {bars: 2.9, barGap: 0.7, results: 5.3, resultGap: 0.35, focus: 6.8, debate: 8.2, payoff: 10.4, end: 12.6},
};
// --------------------------------------------------------

const TOP = [640, 900, 1160]; const LANE_H = 220; const TRACK_X = 106; const TRACK_W = 828;

/** Hook visual: supplier quote card readable from frame 1; a red slash cuts through the price, then a "real cost?" tag pops. */
const QuoteCard: React.FC<{t: number}> = ({t}) => {
  const out = clamp((t - 2.2) / 0.3); if (out >= 1) return null;
  const q = CONFIG.quote; const sl = easeOut((t - q.slashAt) / 0.25); const tg = t >= q.tagAt ? backOut((t - q.tagAt) / 0.3) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 110, top: 620, width: 860, height: 480, borderRadius: 40, background: '#1c1918', border: `4px solid ${sl > 0.5 ? C.red : C.line}`,
        boxShadow: sl > 0.5 ? '0 0 70px rgba(229,56,59,.35)' : '0 20px 40px rgba(0,0,0,.5)', textAlign: 'center'}}>
        <div style={{position: 'absolute', left: 50, top: 46, fontSize: 36, fontWeight: 800, letterSpacing: 3, color: C.muted}}>{q.label}</div>
        <div style={{position: 'absolute', right: 50, top: 40, fontSize: 32, fontWeight: 800, background: '#2a2524', padding: '6px 16px', borderRadius: 10, color: '#cfc7c1'}}>MOQ 500</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, fontSize: 250, fontWeight: 900, letterSpacing: -10, lineHeight: 1, color: sl > 0.5 ? '#8a817c' : C.white}}>
          <span style={{position: 'relative', display: 'inline-block'}}>{q.value}
            <span style={{position: 'absolute', left: -20, top: '52%', height: 26, width: `${(100 + 12) * sl}%`, background: C.red, borderRadius: 13, transform: 'rotate(-10deg)',
              transformOrigin: '0 50%', boxShadow: '0 0 30px rgba(229,56,59,.7)'}} /></span></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 390, fontSize: 44, fontWeight: 700, color: '#cfc7c1'}}>{q.unit}</div>
      </div>
      {t >= q.tagAt && (
        <div style={{position: 'absolute', left: 470, top: 1060, zIndex: 25, fontSize: 60, fontWeight: 900, color: C.bg, background: C.white, whiteSpace: 'nowrap',
          borderRadius: 20, padding: '12px 30px', transform: `rotate(-5deg) scale(${tg})`, boxShadow: '0 20px 60px rgba(0,0,0,.6)'}}>{q.tag}</div>
      )}
    </div>
  );
};

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const focus = t >= T.focus && t < T.debate;
  const zoom = focus ? 1 + 0.07 * easeOut((t - T.focus) / 0.35) : (t < 2.5 ? 1 + 0.05 * easeOut((t - CONFIG.quote.slashAt - 0.25) / 0.4) : 1);
  const out = t >= T.payoff ? easeOut((t - T.payoff) / 0.4) : 0;
  const lanesIn = t >= 2.6;
  const lanes3d: Lane3D[] = CONFIG.rows.map((r, i) => ({y: TOP[i] + LANE_H - 26 - 18, fromX: TRACK_X, maxW: TRACK_W, value: r.value, scaleMax: CONFIG.scaleMax,
    startS: T.bars + i * T.barGap, resultS: T.results + i * T.resultGap, good: r.good}));
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: focus ? '540px 1150px' : '540px 800px'}}>
        {CONFIG.showExampleLabel && <ExampleLabel dim={t >= T.debate && t < T.payoff} />}
        <Hook lines={CONFIG.hook} />
        <QuoteCard t={t} />
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
          <div style={{position: 'absolute', left: 140, top: 1088, zIndex: 30, fontSize: 44, fontWeight: 900, background: C.red, padding: '14px 26px', borderRadius: 16,
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
              {CONFIG.payoff.prefix}{(CONFIG.payoff.value * easeOut((t - T.payoff - 0.2) / 0.6)).toFixed(2)}<span style={{fontSize: 120, letterSpacing: -4}}>{CONFIG.payoff.suffix}</span></div>
            <div style={{fontSize: 36, fontWeight: 700, color: '#cfc7c1', marginTop: 26, whiteSpace: 'pre-line', lineHeight: 1.35}}>{CONFIG.payoff.formula}</div>
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
