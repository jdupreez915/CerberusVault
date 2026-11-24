/**
 * DAILY VIDEO — 2026-11-24 · format B (maths breakdown) · Store Profit OS.
 * Idea: $50/day on ads (example). A $39.99 sale leaves $24.13 before ads (example). $50 ÷ $24.13 = 2.07
 *       → you need 3 sales a day just to break even. 2 sales = −$1.74 for the day; 3 sales = +$22.39.
 * Timeline (s): 0 hook + ad-spend meter ticking · 2.5 "per sale, before ads" · 2.8–4.3 four rows + 3D bars
 *               · 5.0 = $24.13 kept · 6.8 colour flip + $50 ÷ $24.13 = 2.07 slam (punch-in) · 8.4 debate bubble
 *               · 10.4 payoff day table (3D ring) · 12.6 end card · 15.0 end.
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
  hook: ['$50 a day', 'on ads?', 'You need', '[3 sales].'],
  spend: 50,
  rows: [
    {label: 'Sale price', v: 39.99, sign: '', good: true},
    {label: 'Product + shipping', v: 12.70, sign: '−', good: false},
    {label: 'Fees + refunds', v: 2.66, sign: '−', good: false},
    {label: 'Other costs', v: 0.50, sign: '−', good: false},
  ],
  kept: 24.13,
  captions: [
    {at: 2.5, text: 'Per sale, [before ads]'}, {at: 5.0, text: 'You keep [$24.13]'}, {at: 6.8, text: 'Now pay the [ads]'},
    {at: 8.4, text: '[Hot] take:'}, {at: 10.4, text: 'Sale #3 = [profit]'},
  ],
  debate: 'Your first 2 sales\na day pay [Meta].\nNot you.',
  payoff: {kicker: 'ONE DAY · $50 AD SPEND', rows: [{n: '2 sales', v: '−$1.74', good: false}, {n: '3 sales', v: '+$22.39', good: true}], note: 'break-even = 2.07 sales a day'},
  end: {line1: 'Know your break-even', line2: 'before you spend.', product: 'Store Profit OS', pillSize: 46},
  t: {rows: 2.8, rowGap: 0.45, total: 5.0, flip: 6.8, debate: 8.4, payoff: 10.4, end: 12.6},
};
// --------------------------------------------------------

const ROW0 = 480, ROW_H = 140, ROW_GAP = 155, BAR_X = 106, BAR_W = 560;
const money = (v: number) => '$' + v.toFixed(2);

/** Hook visual: today's ad spend meter ticking up, sales counter stuck. Visible from frame 1. */
const SpendMeter: React.FC<{t: number}> = ({t}) => {
  const out = clamp((t - 2.2) / 0.3); if (out >= 1) return null;
  const spend = 8 + (CONFIG.spend - 8) * easeOut(t / 2.0);
  const sales = t < 0.9 ? 0 : t < 1.6 ? 1 : 2;
  const salePop = t >= 0.9 ? backOut(((t < 1.6 ? t - 0.9 : t - 1.6)) / 0.25) : 1;
  return (
    <div style={{position: 'absolute', left: 70, top: 790, width: 900, zIndex: 20, opacity: 1 - out, transform: `translateY(${out * 40}px)`}}>
      <div style={{borderRadius: 32, background: C.panel, border: `3px solid ${C.line}`, padding: '34px 40px'}}>
        <div style={{fontSize: 32, fontWeight: 800, letterSpacing: 3, color: C.muted}}>AD SPEND TODAY</div>
        <div style={{fontSize: 150, fontWeight: 900, letterSpacing: -6, lineHeight: 1.05, color: C.red, fontVariantNumeric: 'tabular-nums'}}>{money(spend)}</div>
        <div style={{height: 26, borderRadius: 13, background: '#2a2524', marginTop: 10, overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${(spend / CONFIG.spend) * 100}%`, background: C.red, boxShadow: '0 0 30px rgba(229,56,59,.6)'}} />
        </div>
      </div>
      <div style={{position: 'absolute', right: -10, top: -50, background: C.white, color: C.bg, borderRadius: 24, padding: '14px 28px', fontSize: 48, fontWeight: 900,
        transform: `rotate(5deg) scale(${0.85 + 0.15 * salePop})`}}>sales: {sales}</div>
    </div>
  );
};

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const flipped = t >= T.flip;
  const zoom = flipped && t < T.debate ? 1 + 0.08 * easeOut((t - T.flip) / 0.35) : 1;
  const rowsOut = flipped ? easeOut((t - T.flip - 0.5) / 0.35) : 0;
  const lanes: Lane3D[] = CONFIG.rows.map((r, i) => ({y: ROW0 + i * ROW_GAP + 108, fromX: BAR_X, maxW: BAR_W, value: r.v, scaleMax: 40,
    startS: T.rows + i * T.rowGap + 0.1, resultS: T.total, good: r.good}));
  const shown = CONFIG.rows.reduce((a, r, i) => a + (t >= T.rows + i * T.rowGap + 0.2 ? (r.good ? r.v : -r.v) : 0), 0);
  const slam = t >= T.flip + 0.55 ? backOut((t - T.flip - 0.55) / 0.3) : 0;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 900px'}}>
        <ExampleLabel dim={t >= T.debate && t < T.payoff} />
        <Hook lines={CONFIG.hook} />
        <SpendMeter t={t} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />
        {t >= T.rows && rowsOut < 1 && CONFIG.rows.map((r, i) => {
          const st = T.rows + i * T.rowGap; if (t < st) return null;
          const k = backOut((t - st) / 0.3);
          const col = t >= T.total ? (r.good ? C.green : C.red) : C.white;
          return (
            <div key={i} style={{position: 'absolute', left: 70, top: ROW0 + i * ROW_GAP, width: 900, height: ROW_H, borderRadius: 24, zIndex: 5,
              background: flipped ? '#1f1112' : C.panel, border: `3px solid ${flipped ? C.red : C.line}`,
              opacity: clamp((t - st) / 0.12) * (1 - rowsOut), transform: `translateX(${(1 - k) * 180}px) translateY(${rowsOut * -60}px)`}}>
              <div style={{position: 'absolute', left: 30, top: 16, fontSize: 44, fontWeight: 900, letterSpacing: -1}}>{r.label}</div>
              <div style={{position: 'absolute', right: 30, top: 34, fontSize: 58, fontWeight: 900, color: col, fontVariantNumeric: 'tabular-nums'}}>{r.sign}{money(r.v)}</div>
            </div>
          );
        })}
        {t >= T.rows + 0.2 && rowsOut < 1 && (
          <div style={{position: 'absolute', left: 70, top: ROW0 + 4 * ROW_GAP + 10, width: 900, height: 130, borderRadius: 24, zIndex: 5, background: t >= T.total ? C.white : 'transparent',
            color: t >= T.total ? C.bg : C.white, border: `3px dashed ${t >= T.total ? C.white : C.line}`, display: 'flex', alignItems: 'center', padding: '0 30px',
            opacity: 1 - rowsOut, transform: `scale(${t >= T.total ? 1 + 0.06 * (1 - clamp((t - T.total) / 0.3)) : 1})`}}>
            <div style={{fontSize: 44, fontWeight: 900}}>= kept per sale</div>
            <div style={{marginLeft: 'auto', fontSize: 76, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{money(t >= T.total ? CONFIG.kept : shown)}</div>
          </div>
        )}
        {rowsOut < 1 && <Canvas3D zIndex={10} opacity={1 - rowsOut}>
          <Drifters />
          <Bars3D lanes={lanes.filter((l) => t >= l.startS)} />
        </Canvas3D>}
        {t >= T.flip + 0.55 && t < T.debate && (
          <div style={{position: 'absolute', left: 70, top: 540, width: 900, textAlign: 'center', zIndex: 30, opacity: clamp((t - T.flip - 0.55) / 0.1)}}>
            <div style={{fontSize: 92, fontWeight: 900, letterSpacing: -2, color: '#cfc7c1'}}>$50 ÷ $24.13</div>
            <div style={{fontSize: 290, fontWeight: 900, letterSpacing: -12, lineHeight: 1, color: C.red, marginTop: 10, transform: `scale(${2 - slam})`, textShadow: '0 0 60px rgba(229,56,59,.5)'}}>2.07</div>
            {t >= T.flip + 1.0 && <div style={{display: 'inline-block', marginTop: 40, fontSize: 46, fontWeight: 900, background: C.white, color: C.bg, padding: '14px 28px', borderRadius: 16,
              transform: `rotate(-3deg) scale(${backOut((t - T.flip - 1.0) / 0.25)})`}}>sales a day to break even</div>}
          </div>
        )}
        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.payoff} />
        {t >= T.payoff + 0.1 && t < T.end && (<>
          <Canvas3D zIndex={25}><PayoffRing cx={540} cy={870} fromS={T.payoff + 0.1} toS={T.end} r={360} /></Canvas3D>
          <div style={{position: 'absolute', left: 70, top: 520, width: 900, height: 700, borderRadius: 36, background: 'rgba(16,26,19,.88)', border: `4px solid ${C.green}`,
            boxShadow: '0 0 80px rgba(94,227,143,.35)', textAlign: 'center', paddingTop: 50, zIndex: 30, opacity: clamp((t - T.payoff - 0.1) / 0.2),
            transform: `scale(${0.9 + 0.1 * backOut((t - T.payoff - 0.1) / 0.3)})`}}>
            <div style={{fontSize: 38, fontWeight: 800, letterSpacing: 4, color: C.green}}>{CONFIG.payoff.kicker}</div>
            {CONFIG.payoff.rows.map((r, i) => {
              const at = T.payoff + 0.3 + i * 0.6; if (t < at) return null;
              const k = backOut((t - at) / 0.3);
              return (
                <div key={i} style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 50px 0', transform: `scale(${0.8 + 0.2 * k})`, opacity: clamp((t - at) / 0.1)}}>
                  <div style={{fontSize: 64, fontWeight: 900, color: r.good ? C.white : '#a39a95'}}>{r.n}</div>
                  <div style={{fontSize: r.good ? 140 : 96, fontWeight: 900, letterSpacing: -5, color: r.good ? C.green : C.red, fontVariantNumeric: 'tabular-nums',
                    textShadow: r.good ? '0 0 40px rgba(94,227,143,.45)' : 'none'}}>{r.v}</div>
                </div>
              );
            })}
            {t >= T.payoff + 1.3 && (
              <div style={{display: 'inline-block', marginTop: 34, background: '#0a0909', border: `3px solid ${C.green}`, borderRadius: 999, padding: '14px 34px',
                fontSize: 38, fontWeight: 800, color: C.green, transform: `scale(${backOut((t - T.payoff - 1.3) / 0.3)})`}}>{CONFIG.payoff.note}</div>
            )}
          </div>
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};
