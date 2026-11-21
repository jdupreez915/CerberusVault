/**
 * DAILY VIDEO — 2026-11-21 · format B (maths breakdown) · Instagram Comment-to-DM Automation.
 * Idea: one "comment LINK" reel gets 120 comments (example). Replying by hand = 5 steps, 40 s each → 80 minutes.
 *       The automation sends the DM and logs the lead as comments come in → 0 minutes of copy-paste.
 * Timeline (s): 0 hook + comment flood + ×120 counter · 2.5 "one reply, by hand" · 2.8–4.6 five step rows + 3D bars
 *               · 5.0 = 40 s total · 6.8 colour flip + 40 s × 120 = 80 MIN slam (punch-in) · 8.4 debate bubble
 *               · 10.4 payoff 80→0 min (3D ring) · 12.6 end card · 15.0 end.
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
  hook: ['120 “LINK”', 'comments =', '[80 min] of', 'copy-paste.'],
  flood: {count: 120, names: ['@mia.shop', '@dan_k', '@lena.co', '@ro.store', '@jt_drops', '@sam.home', '@nik.fit', '@ava_b', '@max.goods', '@zoe.r', '@kai.store', '@liv.m']},
  steps: [
    {label: 'Open the comment', s: 5}, {label: 'Copy your link', s: 5}, {label: 'Open their DMs', s: 10},
    {label: 'Type a message', s: 10}, {label: 'Log the lead', s: 10},
  ],
  captions: [
    {at: 2.5, text: 'One reply, [by hand]'}, {at: 5.0, text: '[40 sec] each'}, {at: 6.8, text: '× [120] comments'},
    {at: 8.4, text: '[Hot] take:'}, {at: 10.4, text: 'Or let it [run]'},
  ],
  debate: '“Comment LINK” posts\naren’t cringe.\n[Slow replies] are.',
  payoff: {kicker: 'WITH THE AUTOMATION', from: 80, suffix: ' min', formula: 'comment “LINK” → DM with your link → lead logged', note: 'you check a Sheet, not 120 comments'},
  end: {line1: 'Let the comment', line2: 'send the link.', product: 'Comment-to-DM Automation', pillSize: 42},
  t: {steps: 2.8, stepGap: 0.45, total: 5.0, flip: 6.8, debate: 8.4, payoff: 10.4, end: 12.6},
};
// --------------------------------------------------------

const ROW0 = 480, ROW_H = 130, ROW_GAP = 140, BAR_X = 106, BAR_W = 560;

/** Hook visual: "LINK" comments flooding in + a ×120 counter. Visible from frame 1. */
const Flood: React.FC<{t: number}> = ({t}) => {
  const out = clamp((t - 2.2) / 0.3); if (out >= 1) return null;
  const n = Math.min(12, 4 + Math.floor(t / 0.22));
  const count = Math.round(14 + (CONFIG.flood.count - 14) * easeOut(t / 2.0));
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, opacity: 1 - out}}>
      {CONFIG.flood.names.slice(0, n).map((name, i) => {
        const at = i < 4 ? -1 : (i - 3) * 0.22; const k = at < 0 ? 1 : backOut((t - at) / 0.25);
        const col = i % 2, row = Math.floor(i / 2);
        return (
          <div key={i} style={{position: 'absolute', left: 80 + col * 440, top: 800 + row * 96, width: 410, height: 80, borderRadius: 40, background: '#1c1918',
            border: `3px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', transform: `scale(${0.7 + 0.3 * k})`, opacity: clamp(k * 1.5)}}>
            <div style={{width: 44, height: 44, borderRadius: '50%', background: i % 3 ? '#3a3433' : C.red}} />
            <div style={{fontSize: 26, fontWeight: 700, color: C.muted}}>{name}</div>
            <div style={{marginLeft: 'auto', fontSize: 32, fontWeight: 900}}>LINK</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 620, top: 670, zIndex: 25, fontSize: 92, fontWeight: 900, color: C.white, background: C.red, borderRadius: 28,
        padding: '4px 30px', transform: `rotate(6deg) scale(${1 + 0.06 * Math.sin(t * 14)})`, boxShadow: '0 0 60px rgba(229,56,59,.5)', fontVariantNumeric: 'tabular-nums'}}>×{count}</div>
    </div>
  );
};

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const flipped = t >= T.flip;
  const zoom = flipped && t < T.debate ? 1 + 0.08 * easeOut((t - T.flip) / 0.35) : 1;
  const rowsOut = flipped ? easeOut((t - T.flip - 0.5) / 0.35) : 0;
  const totalSec = CONFIG.steps.reduce((a, s) => a + s.s, 0);
  const lanes: Lane3D[] = CONFIG.steps.map((s, i) => ({y: ROW0 + i * ROW_GAP + 100, fromX: BAR_X, maxW: BAR_W, value: s.s, scaleMax: 10,
    startS: T.steps + i * T.stepGap + 0.1, resultS: T.flip, good: false}));
  const shownSec = CONFIG.steps.reduce((a, s, i) => a + (t >= T.steps + i * T.stepGap + 0.2 ? s.s : 0), 0);
  const slam = t >= T.flip + 0.55 ? backOut((t - T.flip - 0.55) / 0.3) : 0;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 900px'}}>
        <ExampleLabel dim={t >= T.debate && t < T.payoff} />
        <Hook lines={CONFIG.hook} />
        <Flood t={t} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />
        {t >= T.steps && rowsOut < 1 && CONFIG.steps.map((s, i) => {
          const st = T.steps + i * T.stepGap; if (t < st) return null;
          const k = backOut((t - st) / 0.3);
          return (
            <div key={i} style={{position: 'absolute', left: 70, top: ROW0 + i * ROW_GAP, width: 900, height: ROW_H, borderRadius: 24, zIndex: 5,
              background: flipped ? '#1f1112' : C.panel, border: `3px solid ${flipped ? C.red : C.line}`,
              opacity: clamp((t - st) / 0.12) * (1 - rowsOut), transform: `translateX(${(1 - k) * 180}px) translateY(${rowsOut * -60}px)`}}>
              <div style={{position: 'absolute', left: 30, top: 14, fontSize: 44, fontWeight: 900, letterSpacing: -1}}><span style={{color: C.muted}}>{i + 1}.</span> {s.label}</div>
              <div style={{position: 'absolute', right: 30, top: 32, fontSize: 56, fontWeight: 900, color: flipped ? C.red : C.white, fontVariantNumeric: 'tabular-nums'}}>{s.s} s</div>
            </div>
          );
        })}
        {t >= T.steps + 0.2 && rowsOut < 1 && (
          <div style={{position: 'absolute', left: 70, top: ROW0 + 5 * ROW_GAP + 10, width: 900, height: 120, borderRadius: 24, zIndex: 5, background: t >= T.total ? C.white : 'transparent',
            color: t >= T.total ? C.bg : C.white, border: `3px dashed ${t >= T.total ? C.white : C.line}`, display: 'flex', alignItems: 'center', padding: '0 30px',
            opacity: 1 - rowsOut, transform: `scale(${t >= T.total ? 1 + 0.06 * (1 - clamp((t - T.total) / 0.3)) : 1})`}}>
            <div style={{fontSize: 46, fontWeight: 900}}>= one reply</div>
            <div style={{marginLeft: 'auto', fontSize: 72, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{t >= T.total ? totalSec : shownSec} s</div>
          </div>
        )}
        {rowsOut < 1 && <Canvas3D zIndex={10} opacity={1 - rowsOut}>
          <Drifters />
          <Bars3D lanes={lanes.filter((l) => t >= l.startS)} />
        </Canvas3D>}
        {t >= T.flip + 0.55 && t < T.debate && (
          <div style={{position: 'absolute', left: 70, top: 560, width: 900, textAlign: 'center', zIndex: 30, opacity: clamp((t - T.flip - 0.55) / 0.1)}}>
            <div style={{fontSize: 96, fontWeight: 900, letterSpacing: -2, color: '#cfc7c1'}}>40 s × 120</div>
            <div style={{fontSize: 250, fontWeight: 900, letterSpacing: -10, lineHeight: 1, color: C.red, marginTop: 10, transform: `scale(${2 - slam})`, textShadow: '0 0 60px rgba(229,56,59,.5)'}}>80 MIN</div>
            {t >= T.flip + 1.0 && <div style={{display: 'inline-block', marginTop: 40, fontSize: 44, fontWeight: 900, background: C.white, color: C.bg, padding: '14px 28px', borderRadius: 16,
              transform: `rotate(-3deg) scale(${backOut((t - T.flip - 1.0) / 0.25)})`}}>for ONE reel</div>}
          </div>
        )}
        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.payoff} />
        {t >= T.payoff + 0.1 && t < T.end && (<>
          <Canvas3D zIndex={25}><PayoffRing cx={540} cy={860} fromS={T.payoff + 0.1} toS={T.end} r={340} /></Canvas3D>
          <div style={{position: 'absolute', left: 70, top: 540, width: 900, height: 660, borderRadius: 36, background: 'rgba(16,26,19,.86)', border: `4px solid ${C.green}`,
            boxShadow: '0 0 80px rgba(94,227,143,.35)', textAlign: 'center', paddingTop: 56, zIndex: 30, opacity: clamp((t - T.payoff - 0.1) / 0.2),
            transform: `scale(${0.9 + 0.1 * backOut((t - T.payoff - 0.1) / 0.3)})`}}>
            <div style={{fontSize: 42, fontWeight: 800, letterSpacing: 4, color: C.green}}>{CONFIG.payoff.kicker}</div>
            <div style={{fontSize: 230, fontWeight: 900, letterSpacing: -9, lineHeight: 1, marginTop: 14, fontVariantNumeric: 'tabular-nums'}}>
              {Math.round(CONFIG.payoff.from * (1 - easeOut((t - T.payoff - 0.3) / 0.8)))}{CONFIG.payoff.suffix}</div>
            <div style={{fontSize: 34, fontWeight: 700, color: '#cfc7c1', marginTop: 30, padding: '0 40px'}}>{CONFIG.payoff.formula}</div>
            {t >= T.payoff + 1.1 && (
              <div style={{display: 'inline-block', marginTop: 30, background: '#0a0909', border: `3px solid ${C.green}`, borderRadius: 999, padding: '14px 34px',
                fontSize: 38, fontWeight: 800, color: C.green, transform: `scale(${backOut((t - T.payoff - 1.1) / 0.3)})`}}>{CONFIG.payoff.note}</div>
            )}
          </div>
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};
