/**
 * DAILY VIDEO — 2026-11-19 · format C (product demo) · Ecom Operating System.
 * Idea: the weekly 10-minute check (orders, ads, stock, P&L) turns into a 13-week cash view that shows a stock reorder
 *       pushing week 7 below zero (example figures); splitting the reorder keeps every week above $0.
 * Timeline (s): 0 hook · 2.4 workbook tabs tick in · 5.0 13-week cash bars grow (3D) · 6.8 week 7 goes red + punch-in
 *               · 8.4 debate bubble · 10.4 bars morph (split reorder) · 11.4 payoff (+$260, 3D ring) · 13.0 end card · 15.5 end.
 */
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from './brand';
import {Hook} from './components/Hook';
import {BeatCaption} from './components/BeatCaption';
import {CommentBubble} from './components/CommentBubble';
import {EndCard} from './components/EndCard';
import {ExampleLabel} from './components/ExampleLabel';
import {Canvas3D, Drifters, PayoffRing} from './components/Lanes3D';
import {backOut, clamp, easeOut} from './components/anim';

export const DAILY_SECONDS = 15.5;

// ---------------- CONFIG (edit per day) ----------------
const CONFIG = {
  showExampleLabel: true,
  hook: ['Your bank balance', 'isn’t your [budget].'],
  tabs: ['ORDERS', 'ADS', 'STOCK', 'P&L'],
  tabNote: '10 minutes a week · paste & go',
  // 13-week closing cash (example): +$500 a week, $12,440 stock reorder lands in week 7
  weeksA: [8400, 8900, 9350, 9800, 10250, 10700, -1240, -740, -240, 260, 760, 1260, 1760],
  // same reorder split in two ($6,220 in week 7 and week 10)
  weeksB: [8400, 8900, 9350, 9800, 10250, 10700, 4980, 5480, 5980, 260, 760, 1260, 1760],
  badge: 'WEEK 7: −$1,240',
  badgeNote: '$12,440 stock reorder lands',
  captions: [
    {at: 2.4, text: '10 min a [week]'}, {at: 5.0, text: 'Cash, [13 weeks] out'}, {at: 6.8, text: 'Spot [week 7]'},
    {at: 8.4, text: '[Hot] take:'}, {at: 10.4, text: 'Split the [reorder]'},
  ],
  debate: 'Profitable stores still go broke.\nThey [never saw week 7].',
  payoff: {kicker: 'LOWEST WEEK AFTER THE SPLIT', value: 260, formula: 'reorder paid in weeks 7 + 10', verdict: 'NEVER BELOW $0', verdictNote: 'same stock'},
  end: {line1: 'See week 7', line2: 'six weeks early.', product: 'Ecom Operating System', pillSize: 44},
  t: {tabs: 2.4, tabGap: 0.5, chart: 5.0, barGap: 0.1, red: 6.8, debate: 8.4, morph: 10.4, payoff: 11.4, verdict: 12.2, end: 13.0},
};
// --------------------------------------------------------

// chart geometry (page pixels)
const CH = {left: 100, top: 560, width: 880, zeroY: 1170, maxH: 520, maxV: 11200, barW: 50, gap: 17.7};
const barX = (i: number) => CH.left + 30 + i * (CH.barW + CH.gap) + CH.barW / 2;
const px = (x: number, y: number): [number, number, number] => [x - 540, 960 - y, 0];

/** Vertical 3D cash column: grows from the zero line; negative values hang below it. */
const CashBar: React.FC<{i: number; v: number; startS: number; color: string; glow: boolean}> = ({i, v, startS, color, glow}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const p = easeOut((t - startS) / 0.5);
  const h = Math.max(2, Math.abs(v) / CH.maxV * CH.maxH * p);
  const cy = v >= 0 ? CH.zeroY - h / 2 : CH.zeroY + h / 2;
  const [x, y] = px(barX(i), cy);
  return (
    <mesh position={[x, y, 40]} rotation={[0.18, -0.5 + 0.06 * Math.sin(t * 1.4 + i), 0]}>
      <boxGeometry args={[CH.barW, h, 34]} />
      <meshStandardMaterial color={color} emissive={glow ? color : '#000000'} emissiveIntensity={glow ? 0.35 : 0} metalness={0.3} roughness={0.35} />
    </mesh>
  );
};

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const focus = t >= T.red && t < T.debate;
  const zoom = focus ? 1 + 0.08 * easeOut((t - T.red) / 0.35) : (t < 2.4 ? 1 + 0.04 * easeOut((t - 1.2) / 0.5) : 1);
  const m = easeOut((t - T.morph) / 0.6); // 0 → 1 morph to split series
  const vals = CONFIG.weeksA.map((a, i) => a + (CONFIG.weeksB[i] - a) * m);
  const chartIn = clamp((t - T.chart + 0.2) / 0.3);
  const tabsOut = easeOut((t - T.chart + 0.3) / 0.4);
  const cardIn = t >= T.payoff ? clamp((t - T.payoff) / 0.2) : 0;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: focus ? `${barX(6)}px 1150px` : '540px 900px'}}>
        {CONFIG.showExampleLabel && t >= T.chart - 0.2 && <ExampleLabel dim={t >= T.debate && t < T.morph} />}
        <Hook lines={CONFIG.hook} size={108} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />

        {/* Beat 1: the weekly workbook — tabs tick in */}
        {t >= T.tabs && tabsOut < 1 && (
          <div style={{position: 'absolute', left: 70, top: 560, width: 900, height: 640, borderRadius: 32, background: C.panel, border: `3px solid ${C.line}`,
            zIndex: 6, opacity: clamp((t - T.tabs) / 0.15) * (1 - tabsOut), transform: `translateY(${(1 - backOut((t - T.tabs) / 0.35)) * 120 - tabsOut * 200}px) scale(${1 - 0.15 * tabsOut})`}}>
            <div style={{position: 'absolute', left: 40, top: 30, fontSize: 36, fontWeight: 800, color: C.muted, letterSpacing: 2}}>ECOM OPERATING SYSTEM</div>
            {CONFIG.tabs.map((tab, i) => {
              const st = T.tabs + 0.2 + i * T.tabGap; const on = t >= st; const k = backOut((t - st) / 0.25);
              return (
                <div key={i} style={{position: 'absolute', left: 40, top: 100 + i * 118, width: 820, height: 98, borderRadius: 20,
                  background: on ? '#101a13' : '#211d1c', border: `3px solid ${on ? C.green : C.line}`, display: 'flex', alignItems: 'center', padding: '0 30px'}}>
                  <span style={{fontSize: 52, fontWeight: 900, letterSpacing: -1}}>{tab}</span>
                  <span style={{marginLeft: 'auto', fontSize: 34, fontWeight: 800, color: C.green, opacity: on ? 1 : 0, transform: `scale(${on ? k : 0})`, display: 'inline-block'}}>✓ updated</span>
                </div>
              );
            })}
            <div style={{position: 'absolute', left: 40, top: 586, fontSize: 32, fontWeight: 700, color: '#b9b0aa'}}>{CONFIG.tabNote}</div>
          </div>
        )}

        {/* Beat 2: 13-week cash chart */}
        {t >= T.chart - 0.2 && (<>
          <div style={{position: 'absolute', left: 70, top: 420, width: 900, height: 900, borderRadius: 32, background: C.panel, border: `3px solid ${C.line}`, zIndex: 4,
            opacity: chartIn * (1 - 0.7 * cardIn)}}>
            <div style={{position: 'absolute', left: 36, top: 26, fontSize: 38, fontWeight: 900, letterSpacing: 1}}>13-WEEK CASH <span style={{color: C.muted, fontWeight: 700, fontSize: 30}}>closing balance</span></div>
          </div>
          <div style={{position: 'absolute', left: 90, width: 900, top: CH.zeroY - 2, height: 4, background: '#5c5552', zIndex: 5, opacity: chartIn}} />
          {vals.map((_, i) => (
            <div key={i} style={{position: 'absolute', left: barX(i) - 30, width: 60, top: 1260, textAlign: 'center', fontSize: 24, fontWeight: 800,
              color: (i === 6 && t >= T.red && m < 0.5) || ((i === 6 || i === 9) && m >= 0.5) ? C.white : C.muted, zIndex: 5, opacity: chartIn}}>W{i + 1}</div>
          ))}
          <Canvas3D zIndex={8} opacity={1 - 0.6 * cardIn}>
            <Drifters />
            {vals.map((v, i) => {
              const red = i === 6 && t >= T.red && m < 0.5;
              const green = (i === 6 || i === 9) && m >= 0.5;
              return <CashBar key={i} i={i} v={v} startS={T.chart + i * T.barGap} color={red ? C.red : green ? C.green : C.white} glow={red || green} />;
            })}
          </Canvas3D>
          <div style={{position: 'absolute', left: 120, top: 520, fontSize: 30, fontWeight: 800, color: '#b9b0aa', zIndex: 9, opacity: chartIn * (t < T.morph ? 1 : 0)}}>
            +$500 a week, then the reorder</div>
          <div style={{position: 'absolute', left: 120, top: 520, fontSize: 30, fontWeight: 800, color: C.green, zIndex: 9, opacity: t >= T.morph && t < T.payoff ? clamp((t - T.morph) / 0.2) : 0}}>
            Same reorder, split: W7 + W10</div>
        </>)}

        {/* Week-7 callout */}
        {t >= T.red + 0.15 && t < T.debate && (
          <div style={{position: 'absolute', left: 515, top: 730, zIndex: 30, background: C.red, padding: '16px 24px', borderRadius: 18,
            transform: `rotate(-3deg) scale(${backOut((t - T.red - 0.15) / 0.25)})`, boxShadow: '0 0 50px rgba(229,56,59,.5)'}}>
            <div style={{fontSize: 48, fontWeight: 900, letterSpacing: -1}}>{CONFIG.badge}</div>
            <div style={{fontSize: 28, fontWeight: 700}}>{CONFIG.badgeNote}</div>
          </div>
        )}

        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.morph} />

        {/* Payoff */}
        {t >= T.payoff && t < T.end && (<>
          <Canvas3D zIndex={25}><PayoffRing cx={540} cy={830} fromS={T.payoff + 0.05} toS={T.end} r={360} /></Canvas3D>
          <div style={{position: 'absolute', left: 70, top: 520, width: 900, height: 640, borderRadius: 36, background: 'rgba(16,26,19,.88)', border: `4px solid ${C.green}`,
            boxShadow: '0 0 80px rgba(94,227,143,.3)', textAlign: 'center', paddingTop: 50, zIndex: 30, opacity: cardIn,
            transform: `scale(${0.9 + 0.1 * backOut((t - T.payoff) / 0.3)})`}}>
            <div style={{fontSize: 38, fontWeight: 800, letterSpacing: 3, color: C.green}}>{CONFIG.payoff.kicker}</div>
            <div style={{fontSize: 250, fontWeight: 900, letterSpacing: -10, lineHeight: 1, marginTop: 10, fontVariantNumeric: 'tabular-nums'}}>
              +${Math.round(CONFIG.payoff.value * easeOut((t - T.payoff - 0.1) / 0.6))}</div>
            <div style={{fontSize: 40, fontWeight: 700, color: '#cfc7c1', marginTop: 16}}>{CONFIG.payoff.formula}</div>
            {t >= T.verdict && (
              <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, marginTop: 30, background: '#0a0909', border: `3px solid ${C.green}`, borderRadius: 999,
                padding: '14px 32px', transform: `scale(${backOut((t - T.verdict) / 0.3)})`}}>
                <span style={{fontSize: 42, fontWeight: 900, color: C.green, letterSpacing: 1}}>{CONFIG.payoff.verdict}</span>
                <span style={{fontSize: 34, fontWeight: 700}}>{CONFIG.payoff.verdictNote}</span>
              </div>
            )}
          </div>
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};
