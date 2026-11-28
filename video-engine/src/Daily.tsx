/**
 * DAILY VIDEO — 2026-11-28 · format C (product demo) · Store Profit OS — the what-if panel.
 * Idea (example figures): one $39.99 order. Today: −12.70 product+ship −2.66 fees/refunds (6.65% of price) −0.50 other −14.00 ads = $10.13.
 *   What-if 1: ads 20% cheaper (−$11.20)  → $12.93 (+$2.80).
 *   What-if 2: price +$5 ($44.99, fees $2.99) → $14.80 (+$4.67).
 * Timeline (s): 0 hook + profit card morph · 2.4 app panel slides in · 4.6 profit pops · 5.6 toggle "ads −20%" (punch-in) · 8.0 price slider
 *               (punch-in, 3D coin knob) · 10.2 debate bubble · 11.8 payoff with 3D bars · 13.4 end card · 16.0 end.
 */
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from './brand';
import {Hook} from './components/Hook';
import {BeatCaption} from './components/BeatCaption';
import {CommentBubble} from './components/CommentBubble';
import {EndCard} from './components/EndCard';
import {ExampleLabel} from './components/ExampleLabel';
import {Canvas3D, Bars3D, Drifters, type Lane3D} from './components/Lanes3D';
import {backOut, clamp, easeOut} from './components/anim';

export const DAILY_SECONDS = 16;

// ---------------- CONFIG (edit per day) ----------------
const CONFIG = {
  hook: ['$10.13 → [$14.80]', 'per order.', 'Same product.'],
  base: {price: 39.99, cogs: 12.70, feeRate: 0.0665, other: 0.50, ads: 14.00},
  captions: [
    {at: 2.4, text: 'One [$39.99] sale'}, {at: 4.6, text: 'Profit: [$10.13]'}, {at: 5.6, text: 'Cheaper [ads]?'},
    {at: 8.0, text: 'Or [+$5] price?'}, {at: 10.2, text: '[Hot] take:'}, {at: 11.8, text: 'Extra [per order]'},
  ],
  debate: 'Cheaper ads won’t fix\n[a cheap price].',
  payoff: [{n: 'Ads 20% cheaper', v: 2.80, good: false}, {n: 'Price +$5', v: 4.67, good: true}],
  payoffNote: 'if orders hold · test it first',
  end: {line1: 'Run the what-if', line2: 'before you change it.', product: 'Store Profit OS', pillSize: 46},
  t: {panel: 2.4, total: 4.6, w1: 5.6, w2: 8.0, debate: 10.2, payoff: 11.8, end: 13.4},
};
// --------------------------------------------------------

const P_TOP = 430, ROW_TOP = 520, ROW_H = 96, PROFIT_TOP = 1010, CTRL_TOP = 1190;
const money = (v: number) => (v < 0 ? '−' : '') + '$' + Math.abs(v).toFixed(2);
const px = (x: number, y: number): [number, number, number] => [x - 540, 960 - y, 0];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Model state as a pure function of time. */
const state = (t: number) => {
  const B = CONFIG.base, T = CONFIG.t;
  const adsK = easeOut((t - T.w1 - 0.3) / 0.6) * (1 - easeOut((t - T.w2) / 0.3));
  const priceK = easeOut((t - T.w2 - 0.35) / 0.7);
  const price = lerp(B.price, B.price + 5, priceK);
  const ads = lerp(B.ads, B.ads * 0.8, adsK);
  const fees = Math.round(price * B.feeRate * 100) / 100;
  const profit = price - B.cogs - fees - B.other - ads;
  return {price, ads, fees, profit, adsK, priceK};
};

/** 3D coin used as the slider knob (frame-driven spin). */
const CoinKnob: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const [X, Y] = px(x, y);
  return (
    <mesh position={[X, Y, 60]} rotation={[Math.PI / 2, 0, t * 3]}>
      <cylinderGeometry args={[34, 34, 14, 40]} />
      <meshStandardMaterial color={C.green} emissive={C.green} emissiveIntensity={0.25} metalness={0.6} roughness={0.25} />
    </mesh>
  );
};

/** Hook visual: profit card visible on frame 1, morphs $10.13 → $14.80 at 0.9 s. */
const HookCard: React.FC<{t: number}> = ({t}) => {
  const out = clamp((t - 2.1) / 0.3); if (out >= 1) return null;
  const k = easeOut((t - 0.9) / 0.5); const v = lerp(10.13, 14.80, k);
  return (
    <div style={{position: 'absolute', left: 70, top: 640, width: 900, zIndex: 20, opacity: 1 - out, transform: `translateY(${out * 40}px)`}}>
      <div style={{borderRadius: 32, background: C.panel, border: `3px solid ${k > 0.99 ? C.green : C.line}`, padding: '34px 40px',
        boxShadow: k > 0.99 ? '0 0 60px rgba(94,227,143,.3)' : 'none'}}>
        <div style={{fontSize: 32, fontWeight: 800, letterSpacing: 3, color: C.muted}}>PROFIT PER ORDER · $39.99 ITEM</div>
        <div style={{fontSize: 170, fontWeight: 900, letterSpacing: -6, lineHeight: 1.05, color: k > 0.99 ? C.green : C.white, fontVariantNumeric: 'tabular-nums'}}>{money(v)}</div>
        <div style={{fontSize: 40, fontWeight: 800, color: C.white}}>Same product. Same supplier. <span style={{color: C.red}}>One change.</span></div>
      </div>
      {t >= 1.4 && <div style={{position: 'absolute', right: 26, top: -34, background: C.red, color: C.white, fontSize: 40, fontWeight: 900, padding: '10px 24px', borderRadius: 999,
        transform: `rotate(4deg) scale(${backOut((t - 1.4) / 0.25)})`}}>which one?</div>}
    </div>
  );
};

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t; const B = CONFIG.base;
  const s = state(t);
  const panelIn = backOut((t - T.panel) / 0.4);
  const panelOut = easeOut((t - T.payoff) / 0.2);
  const showPanel = t >= T.panel && panelOut < 1;
  // punch-ins on each what-if
  const punch = (at: number) => (t >= at && t < at + 1.6 ? 0.06 * easeOut((t - at) / 0.3) * (1 - easeOut((t - at - 1.2) / 0.4)) : 0);
  const zoom = 1 + punch(T.w1) + punch(T.w2);
  const rows = [
    {label: 'Sale price', v: s.price, hi: s.priceK > 0 && s.priceK < 1 || (t >= T.w2 + 0.35 && t < T.w2 + 1.6), plus: true},
    {label: 'Product + shipping', v: -B.cogs, hi: false},
    {label: 'Fees + refunds', v: -s.fees, hi: t >= T.w2 + 0.35 && t < T.w2 + 1.6},
    {label: 'Other costs', v: -B.other, hi: false},
    {label: 'Ad cost per sale', v: -s.ads, hi: t >= T.w1 + 0.3 && t < T.w2},
  ];
  const profitOn = t >= T.total; const pPop = profitOn ? 1 + 0.08 * (1 - clamp((t - T.total) / 0.3)) : 1;
  const delta = s.profit - 10.13; const up = delta > 0.005;
  const badge = t >= T.w1 + 0.9 && t < T.w2 ? '+$2.80' : t >= T.w2 + 1.05 ? '+$4.67' : null;
  const badgeAt = t >= T.w2 ? T.w2 + 1.05 : T.w1 + 0.9;
  const knobX = 470 + 400 * s.priceK;
  const lanes: Lane3D[] = CONFIG.payoff.map((r, i) => ({y: 690 + i * 240, fromX: 110, maxW: 560, value: r.v, scaleMax: 5,
    startS: T.payoff + 0.45 + i * 0.5, resultS: T.payoff + 1.3, good: r.good}));
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <Canvas3D zIndex={1} opacity={0.9}><Drifters /></Canvas3D>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: t >= T.w2 ? '540px 1100px' : '540px 1000px'}}>
        <ExampleLabel dim={t >= T.debate && t < T.payoff} />
        <Hook lines={CONFIG.hook} />
        <HookCard t={t} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />
        {showPanel && (
          <div style={{position: 'absolute', left: 70, top: P_TOP, width: 900, height: CTRL_TOP + 220 - P_TOP, borderRadius: 32, background: C.panel, border: `3px solid ${C.line}`,
            zIndex: 5, opacity: clamp((t - T.panel) / 0.15) * (1 - panelOut), transform: `translateY(${(1 - panelIn) * 140 - panelOut * 60}px)`, overflow: 'hidden'}}>
            <div style={{height: 76, background: '#201b1b', display: 'flex', alignItems: 'center', padding: '0 30px', gap: 14, fontSize: 30, fontWeight: 800, letterSpacing: 3, color: C.muted}}>
              <div style={{width: 18, height: 18, borderRadius: 9, background: C.red}} />STORE PROFIT OS · WHAT-IF
            </div>
          </div>
        )}
        {showPanel && rows.map((r, i) => {
          const at = T.panel + 0.25 + i * 0.12; if (t < at) return null;
          const k = backOut((t - at) / 0.3);
          return (
            <div key={i} style={{position: 'absolute', left: 100, top: ROW_TOP + i * ROW_H, width: 840, height: ROW_H - 12, borderRadius: 18, zIndex: 6,
              background: r.hi ? 'rgba(94,227,143,.12)' : 'transparent', border: `3px solid ${r.hi ? C.green : 'transparent'}`, borderBottomColor: r.hi ? C.green : C.line,
              opacity: clamp((t - at) / 0.12) * (1 - panelOut), transform: `translateX(${(1 - k) * 120}px) translateY(${-panelOut * 60}px)`,
              display: 'flex', alignItems: 'center', padding: '0 24px'}}>
              <div style={{fontSize: 44, fontWeight: 800}}>{r.label}</div>
              <div style={{marginLeft: 'auto', fontSize: 54, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: r.hi ? C.green : r.plus ? C.white : '#cfc7c1'}}>
                {r.plus ? money(r.v) : money(r.v)}</div>
            </div>
          );
        })}
        {showPanel && t >= T.panel + 0.9 && (
          <div style={{position: 'absolute', left: 100, top: PROFIT_TOP, width: 840, height: 160, borderRadius: 24, zIndex: 7,
            background: profitOn ? (up ? 'rgba(16,40,24,.95)' : '#0f0d0d') : 'transparent', border: `4px ${profitOn ? 'solid' : 'dashed'} ${up ? C.green : profitOn ? C.white : C.line}`,
            boxShadow: up ? '0 0 60px rgba(94,227,143,.35)' : 'none', display: 'flex', alignItems: 'center', padding: '0 30px',
            opacity: 1 - panelOut, transform: `translateY(${-panelOut * 60}px) scale(${pPop})`}}>
            <div style={{fontSize: 46, fontWeight: 900}}>= Profit</div>
            <div style={{marginLeft: 'auto', fontSize: 104, fontWeight: 900, letterSpacing: -3, fontVariantNumeric: 'tabular-nums', color: up ? C.green : C.white}}>
              {profitOn ? money(s.profit) : '$?'}</div>
            {badge && <div style={{position: 'absolute', right: 20, top: -40, background: C.green, color: C.bg, fontSize: 44, fontWeight: 900, padding: '8px 22px',
              borderRadius: 999, transform: `rotate(-4deg) scale(${backOut((t - badgeAt) / 0.25)})`}}>{badge}</div>}
          </div>
        )}
        {showPanel && t >= T.w1 - 0.1 && (
          <div style={{position: 'absolute', left: 100, top: CTRL_TOP, width: 840, height: 170, zIndex: 8, opacity: clamp((t - T.w1 + 0.1) / 0.15) * (1 - panelOut),
            transform: `translateY(${-panelOut * 60}px)`}}>
            <div style={{position: 'absolute', left: 24, top: 6, fontSize: 40, fontWeight: 800, color: s.adsK > 0.5 ? C.green : C.white}}>Ads 20% cheaper</div>
            <div style={{position: 'absolute', left: 700, top: 4, width: 110, height: 58, borderRadius: 29, background: s.adsK > 0.01 ? C.green : '#3a3433'}}>
              <div style={{position: 'absolute', top: 5, left: 5 + 52 * clamp(s.adsK * 3), width: 48, height: 48, borderRadius: 24, background: C.white}} />
            </div>
            <div style={{position: 'absolute', left: 24, top: 96, fontSize: 40, fontWeight: 800, color: s.priceK > 0.01 ? C.green : C.white}}>Price</div>
            <div style={{position: 'absolute', left: 180, top: 116, width: 630, height: 14, borderRadius: 7, background: '#3a3433'}}>
              <div style={{width: 190 + 400 * s.priceK, height: 14, borderRadius: 7, background: C.green}} />
            </div>
            {t >= T.w2 && <div style={{position: 'absolute', left: knobX - 100 - 70, top: 140, width: 140, textAlign: 'center', fontSize: 30, fontWeight: 900, color: C.green,
              fontVariantNumeric: 'tabular-nums'}}>{money(s.price)}</div>}
          </div>
        )}
        {showPanel && t >= T.w1 - 0.1 && (
          <Canvas3D zIndex={9} opacity={1 - panelOut}><CoinKnob x={knobX} y={CTRL_TOP + 123} t={t} /></Canvas3D>
        )}
        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.payoff} />
        {t >= T.payoff + 0.2 && t < T.end && (<>
          <div style={{position: 'absolute', left: 70, top: 470, fontSize: 38, fontWeight: 800, letterSpacing: 4, color: C.muted, zIndex: 30}}>SAME $39.99 ORDER · EXTRA PROFIT</div>
          {CONFIG.payoff.map((r, i) => {
            const at = T.payoff + 0.3 + i * 0.5; if (t < at) return null;
            const done = t >= T.payoff + 1.3;
            return (
              <div key={i} style={{position: 'absolute', left: 70, top: 560 + i * 240, width: 900, height: 220, zIndex: 30, opacity: clamp((t - at) / 0.12),
                transform: `translateX(${(1 - backOut((t - at) / 0.3)) * 150}px)`}}>
                <div style={{fontSize: 56, fontWeight: 900}}>{r.n}</div>
                <div style={{position: 'absolute', right: 0, top: 70, fontSize: 100, fontWeight: 900, letterSpacing: -3, fontVariantNumeric: 'tabular-nums',
                  color: done ? (r.good ? C.green : C.white) : C.white, textShadow: done && r.good ? '0 0 40px rgba(94,227,143,.5)' : 'none'}}>+${r.v.toFixed(2)}</div>
              </div>
            );
          })}
          <Canvas3D zIndex={29}><Bars3D lanes={lanes.filter((l) => t >= l.startS)} /></Canvas3D>
          {t >= T.payoff + 1.1 && (
            <div style={{position: 'absolute', left: 70, top: 1100, zIndex: 31, background: C.bg, border: `3px solid ${C.red}`, borderRadius: 999, padding: '14px 34px',
              fontSize: 44, fontWeight: 800, color: C.red, transform: `scale(${backOut((t - T.payoff - 1.1) / 0.3)})`, transformOrigin: '0 50%'}}>{CONFIG.payoffNote}</div>
          )}
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};

