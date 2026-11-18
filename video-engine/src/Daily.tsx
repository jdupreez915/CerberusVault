/**
 * DAILY VIDEO — 2026-11-18 · format B (maths breakdown) · Ad Creative Testing System.
 * Idea: follow 1,000 viewers of one ad down the funnel (example figures); the leak is the hook, not the click.
 * Timeline (s): 0 hook · 2.5–4.9 funnel rows drop in · 6.2 punch-in on the hook row + badge · 8.0 debate bubble
 *               · 10.2 payoff (79% + 3D ring) · 11.2 verdict chip · 12.2 end card · 14.7 end.
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

export const DAILY_SECONDS = 14.7;

// ---------------- CONFIG (edit per day) ----------------
const CONFIG = {
  showExampleLabel: true,
  hook: ['1,000 saw your ad.', '[3 bought.]'],
  sub: 'Follow 1,000 viewers down one ad (example)',
  scaleMax: 1000,
  rows: [
    {stage: 'HOOK', what: 'watched past 3 s', kept: 210, lost: 790, leak: true},
    {stage: 'BODY', what: 'watched half', kept: 95, lost: 115, leak: false},
    {stage: 'CLICK', what: 'clicked the link', kept: 18, lost: 77, leak: false},
    {stage: 'BUY', what: 'bought', kept: 3, lost: 15, leak: false},
  ],
  badge: '79% GONE IN 3 SECONDS',
  captions: [
    {at: 2.5, text: 'Where they [drop]'}, {at: 4.9, text: 'Spot the [leak]'}, {at: 6.2, text: 'It’s the [hook]'},
    {at: 8.0, text: '[Hot] take:'}, {at: 10.2, text: 'Fix [this] first'},
  ],
  debate: 'Most “bad ads” don’t fail at the click.\nThey fail in [second one].',
  payoff: {kicker: 'THE LEAK: HOOK', value: 79, suffix: '%', formula: '790 of 1,000 left in the first 3 s', verdict: 'ITERATE', verdictNote: 'new hook · keep the rest'},
  end: {line1: 'Find the leak', line2: 'before you kill the ad.', product: 'Ad Creative Testing System', pillSize: 40},
  t: {rows: 2.5, rowGap: 0.8, focus: 6.2, debate: 8.0, payoff: 10.2, verdict: 11.2, end: 12.2},
};
// --------------------------------------------------------

const TOP = [520, 730, 940, 1150]; const ROW_H = 190; const TRACK_X = 106; const TRACK_W = 828;

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const focus = t >= T.focus && t < T.debate;
  const zoom = focus ? 1 + 0.07 * easeOut((t - T.focus) / 0.35) : (t < 2.5 ? 1 + 0.04 * easeOut((t - 1.2) / 0.5) : 1);
  const out = t >= T.payoff ? easeOut((t - T.payoff) / 0.4) : 0;
  const lanes3d: Lane3D[] = CONFIG.rows.map((r, i) => ({y: TOP[i] + ROW_H - 22 - 16, fromX: TRACK_X, maxW: TRACK_W, value: r.kept, scaleMax: CONFIG.scaleMax,
    startS: T.rows + i * T.rowGap + 0.15, resultS: r.leak ? T.focus : 999, good: false}));
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: focus ? '540px 560px' : '540px 900px'}}>
        {CONFIG.showExampleLabel && <ExampleLabel dim={t >= T.debate && t < T.payoff} />}
        <Hook lines={CONFIG.hook} size={104} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />
        <div style={{position: 'absolute', left: 70, top: 410, width: 900, fontSize: 40, fontWeight: 600, color: '#b9b0aa', zIndex: 20,
          opacity: t >= 2.6 && t < T.payoff ? clamp((t - 2.6) / 0.2) * (1 - out) : 0}}>{CONFIG.sub}</div>
        {CONFIG.rows.map((r, i) => {
          const st = T.rows + i * T.rowGap; if (t < st) return null;
          const p = easeOut((t - st) / 0.6); const inP = backOut((t - st) / 0.35);
          const lit = r.leak && t >= T.focus; const dim = focus && !r.leak ? 0.35 : 1;
          const lostP = clamp((t - st - 0.35) / 0.25);
          return (
            <div key={i} style={{position: 'absolute', left: 70, top: TOP[i], width: 900, height: ROW_H, borderRadius: 28, zIndex: 5,
              background: lit ? '#1f1112' : C.panel, border: `3px solid ${lit ? C.red : C.line}`,
              boxShadow: lit ? `0 0 ${30 + 20 * Math.sin(t * 7)}px rgba(229,56,59,.45)` : 'none',
              opacity: (1 - out) * dim * clamp((t - st) / 0.15), transform: `translateX(${(1 - inP) * -140}px) translateY(${out * 120}px)`}}>
              <div style={{position: 'absolute', left: 34, top: 22, fontSize: 54, fontWeight: 900, letterSpacing: -1}}>{r.stage}
                <span style={{fontSize: 32, fontWeight: 700, color: C.muted, letterSpacing: 0, marginLeft: 18}}>{r.what}</span></div>
              <div style={{position: 'absolute', right: 34, top: 18, fontSize: 64, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{Math.round(r.kept + (1000 - r.kept) * (i === 0 ? 1 - p : 0) + (i > 0 ? (CONFIG.rows[i - 1].kept - r.kept) * (1 - p) : 0))}</div>
              <div style={{position: 'absolute', left: 34, top: 84, fontSize: 32, fontWeight: 800, color: C.red, opacity: lostP,
                transform: `scale(${0.7 + 0.3 * backOut(lostP)})`, transformOrigin: '0 50%'}}>−{r.lost} left</div>
              <div style={{position: 'absolute', left: 36, right: 36, bottom: 22, height: 32, borderRadius: 16, background: '#262120'}} />
            </div>
          );
        })}
        <Canvas3D zIndex={10} opacity={1 - out}>
          <Drifters />
          <Bars3D lanes={lanes3d.filter((l) => t >= l.startS)} />
        </Canvas3D>
        {focus && t >= T.focus + 0.15 && (
          <div style={{position: 'absolute', left: 380, top: 640, zIndex: 30, fontSize: 40, fontWeight: 900, background: C.red, padding: '14px 24px', borderRadius: 16,
            transform: `rotate(-4deg) scale(${backOut((t - T.focus - 0.15) / 0.25)})`}}>{CONFIG.badge}</div>
        )}
        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.payoff} />
        {t >= T.payoff + 0.1 && t < T.end && (<>
          <Canvas3D zIndex={25}><PayoffRing cx={540} cy={830} fromS={T.payoff + 0.1} toS={T.end} r={380} /></Canvas3D>
          <div style={{position: 'absolute', left: 70, top: 560, width: 900, height: 700, borderRadius: 36, background: 'rgba(31,17,18,.84)', border: `4px solid ${C.red}`,
            boxShadow: '0 0 80px rgba(229,56,59,.35)', textAlign: 'center', paddingTop: 54, zIndex: 30, opacity: clamp((t - T.payoff - 0.1) / 0.2),
            transform: `scale(${0.9 + 0.1 * backOut((t - T.payoff - 0.1) / 0.3)})`}}>
            <div style={{fontSize: 44, fontWeight: 800, letterSpacing: 4, color: C.red}}>{CONFIG.payoff.kicker}</div>
            <div style={{fontSize: 280, fontWeight: 900, letterSpacing: -10, lineHeight: 1, marginTop: 6, fontVariantNumeric: 'tabular-nums'}}>
              {Math.round(CONFIG.payoff.value * easeOut((t - T.payoff - 0.2) / 0.6))}{CONFIG.payoff.suffix}</div>
            <div style={{fontSize: 42, fontWeight: 700, color: '#cfc7c1', marginTop: 20}}>{CONFIG.payoff.formula}</div>
            {t >= T.verdict && (
              <div style={{display: 'inline-flex', alignItems: 'center', gap: 20, marginTop: 34, background: '#101a13', border: `3px solid ${C.green}`, borderRadius: 999,
                padding: '16px 34px', transform: `scale(${backOut((t - T.verdict) / 0.3)})`, boxShadow: '0 0 40px rgba(94,227,143,.35)'}}>
                <span style={{fontSize: 46, fontWeight: 900, color: C.green, letterSpacing: 2}}>{CONFIG.payoff.verdict}</span>
                <span style={{fontSize: 36, fontWeight: 700, color: C.white}}>{CONFIG.payoff.verdictNote}</span>
              </div>
            )}
          </div>
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};
