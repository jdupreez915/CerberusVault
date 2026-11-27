/**
 * DAILY VIDEO — 2026-11-27 · format B (maths breakdown) · Ecom Command Center.
 * Idea (example figures): a refunded $39.99 order loses $12.70 product+ship + $6.50 return label + $1.46 fees not refunded
 *       + $14.00 ad cost = −$34.66. Normal sale profit $10.13 → 3.4 sales to win it back. 10 sales: 0 refunds +$101.30, 1 refund +$56.51 (−44%).
 * Timeline (s): 0 hook + order card · 0.9 REFUNDED stamp · 2.5 caption · 2.8–4.15 four loss rows + 3D bars · 5.0 = −$34.66
 *               · 6.8 punch-in + $34.66 ÷ $10.13 = 3.4 · 8.4 debate bubble · 10.4 payoff (3D ring) · 12.6 end card · 15.0 end.
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
  hook: ['Shopify owners:', 'one refund eats', '[3 sales].'],
  rows: [
    {label: 'Product + shipping', v: 12.70},
    {label: 'Return label', v: 6.50},
    {label: 'Fees not refunded', v: 1.46},
    {label: 'Ad cost for that sale', v: 14.00},
  ],
  lost: 34.66, profitPerSale: 10.13,
  captions: [
    {at: 2.5, text: 'What it [really] costs'}, {at: 5.0, text: 'You lose [$34.66]'}, {at: 6.8, text: 'Now [win it back]'},
    {at: 8.4, text: '[Hot] take:'}, {at: 10.4, text: '1 in 10 [refunded]'},
  ],
  debate: '“Free returns” aren’t free.\nYour [next 3 customers]\npay for them.',
  payoff: {kicker: '10 SALES OF $39.99', rows: [{n: '0 refunds', v: '+$101.30', good: true}, {n: '1 refund', v: '+$56.51', good: false}], note: 'one refund = −44% profit'},
  end: {line1: 'Know what a refund', line2: 'really costs you.', product: 'Ecom Command Center', pillSize: 42},
  t: {rows: 2.8, rowGap: 0.45, total: 5.0, flip: 6.8, debate: 8.4, payoff: 10.4, end: 12.6},
};
// --------------------------------------------------------

const ROW0 = 480, ROW_H = 140, ROW_GAP = 155, BAR_X = 106, BAR_W = 560;
const money = (v: number) => (v < 0 ? '−' : '') + '$' + Math.abs(v).toFixed(2);

/** Hook visual: an order notification gets stamped REFUNDED at 0.9 s. Visible from frame 1. */
const RefundCard: React.FC<{t: number}> = ({t}) => {
  const out = clamp((t - 2.2) / 0.3); if (out >= 1) return null;
  const hit = t >= 0.9; const st = hit ? backOut((t - 0.9) / 0.25) : 0;
  const shake = hit && t < 1.3 ? 14 * Math.sin((t - 0.9) * 60) * (1 - (t - 0.9) / 0.4) : 0;
  return (
    <div style={{position: 'absolute', left: 70, top: 760, width: 900, zIndex: 20, opacity: 1 - out, transform: `translateY(${out * 40}px) translateX(${shake}px)`}}>
      <div style={{borderRadius: 32, background: hit ? '#1f1112' : C.panel, border: `3px solid ${hit ? C.red : C.line}`, padding: '34px 40px'}}>
        <div style={{fontSize: 32, fontWeight: 800, letterSpacing: 3, color: C.muted}}>ORDER #1047 · 1 ITEM</div>
        <div style={{fontSize: 150, fontWeight: 900, letterSpacing: -6, lineHeight: 1.05, color: hit ? '#6f6764' : C.green, fontVariantNumeric: 'tabular-nums',
          textDecoration: hit ? 'line-through' : 'none', textDecorationColor: C.red}}>$39.99</div>
        <div style={{fontSize: 40, fontWeight: 800, color: hit ? C.red : C.white}}>{hit ? 'Refund issued' : 'Paid ✓'}</div>
      </div>
      {hit && <div style={{position: 'absolute', right: 30, top: 70, border: `8px solid ${C.red}`, color: C.red, borderRadius: 18, padding: '8px 26px', fontSize: 84, fontWeight: 900,
        letterSpacing: 2, transform: `rotate(-12deg) scale(${2.2 - 1.2 * st})`, opacity: clamp((t - 0.9) / 0.08)}}>REFUNDED</div>}
    </div>
  );
};

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const flipped = t >= T.flip;
  const zoom = flipped && t < T.debate ? 1 + 0.08 * easeOut((t - T.flip) / 0.35) : 1;
  const rowsOut = flipped ? easeOut((t - T.flip - 0.5) / 0.35) : 0;
  const lanes: Lane3D[] = CONFIG.rows.map((r, i) => ({y: ROW0 + i * ROW_GAP + 108, fromX: BAR_X, maxW: BAR_W, value: r.v, scaleMax: 30,
    startS: T.rows + i * T.rowGap + 0.1, resultS: T.total, good: false}));
  const shown = CONFIG.rows.reduce((a, r, i) => a + (t >= T.rows + i * T.rowGap + 0.2 ? -r.v : 0), 0);
  const slam = t >= T.flip + 0.55 ? backOut((t - T.flip - 0.55) / 0.3) : 0;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 900px'}}>
        <ExampleLabel dim={t >= T.debate && t < T.payoff} />
        <Hook lines={CONFIG.hook} />
        <RefundCard t={t} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />
        {t >= T.rows && rowsOut < 1 && CONFIG.rows.map((r, i) => {
          const st = T.rows + i * T.rowGap; if (t < st) return null;
          const k = backOut((t - st) / 0.3);
          const col = t >= T.total ? C.red : C.white;
          return (
            <div key={i} style={{position: 'absolute', left: 70, top: ROW0 + i * ROW_GAP, width: 900, height: ROW_H, borderRadius: 24, zIndex: 5,
              background: flipped ? '#1f1112' : C.panel, border: `3px solid ${flipped ? C.red : C.line}`,
              opacity: clamp((t - st) / 0.12) * (1 - rowsOut), transform: `translateX(${(1 - k) * 180}px) translateY(${rowsOut * -60}px)`}}>
              <div style={{position: 'absolute', left: 30, top: 16, fontSize: 44, fontWeight: 900, letterSpacing: -1}}>{r.label}</div>
              <div style={{position: 'absolute', right: 30, top: 34, fontSize: 58, fontWeight: 900, color: col, fontVariantNumeric: 'tabular-nums'}}>{money(-r.v)}</div>
            </div>
          );
        })}
        {t >= T.rows + 0.2 && rowsOut < 1 && (
          <div style={{position: 'absolute', left: 70, top: ROW0 + 4 * ROW_GAP + 10, width: 900, height: 130, borderRadius: 24, zIndex: 5, background: t >= T.total ? C.red : 'transparent',
            color: C.white, border: `3px dashed ${t >= T.total ? C.red : C.line}`, display: 'flex', alignItems: 'center', padding: '0 30px',
            opacity: 1 - rowsOut, transform: `scale(${t >= T.total ? 1 + 0.06 * (1 - clamp((t - T.total) / 0.3)) : 1})`}}>
            <div style={{fontSize: 44, fontWeight: 900}}>= lost per refund</div>
            <div style={{marginLeft: 'auto', fontSize: 76, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{money(t >= T.total ? -CONFIG.lost : shown)}</div>
          </div>
        )}
        {rowsOut < 1 && <Canvas3D zIndex={10} opacity={1 - rowsOut}>
          <Drifters />
          <Bars3D lanes={lanes.filter((l) => t >= l.startS)} />
        </Canvas3D>}
        {t >= T.flip + 0.55 && t < T.debate && (
          <div style={{position: 'absolute', left: 70, top: 540, width: 900, textAlign: 'center', zIndex: 30, opacity: clamp((t - T.flip - 0.55) / 0.1)}}>
            <div style={{fontSize: 92, fontWeight: 900, letterSpacing: -2, color: '#cfc7c1'}}>$34.66 ÷ $10.13</div>
            <div style={{fontSize: 290, fontWeight: 900, letterSpacing: -12, lineHeight: 1, color: C.red, marginTop: 10, transform: `scale(${2 - slam})`, textShadow: '0 0 60px rgba(229,56,59,.5)'}}>3.4</div>
            {t >= T.flip + 1.0 && <div style={{display: 'inline-block', marginTop: 40, fontSize: 46, fontWeight: 900, background: C.white, color: C.bg, padding: '14px 28px', borderRadius: 16,
              transform: `rotate(-3deg) scale(${backOut((t - T.flip - 1.0) / 0.25)})`}}>sales just to win it back</div>}
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
                  <div style={{fontSize: 60, fontWeight: 900, color: C.white, whiteSpace: 'nowrap'}}>{r.n}</div>
                  <div style={{fontSize: 104, fontWeight: 900, letterSpacing: -4, color: r.good ? C.green : C.red, fontVariantNumeric: 'tabular-nums',
                    textShadow: r.good ? '0 0 40px rgba(94,227,143,.45)' : 'none'}}>{r.v}</div>
                </div>
              );
            })}
            {t >= T.payoff + 1.3 && (
              <div style={{display: 'inline-block', marginTop: 34, background: '#0a0909', border: `3px solid ${C.red}`, borderRadius: 999, padding: '14px 34px',
                fontSize: 42, fontWeight: 800, color: C.red, transform: `scale(${backOut((t - T.payoff - 1.3) / 0.3)})`}}>{CONFIG.payoff.note}</div>
            )}
          </div>
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};
