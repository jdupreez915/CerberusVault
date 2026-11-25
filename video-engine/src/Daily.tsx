/**
 * DAILY VIDEO — 2026-11-25 · format C (product demo) · Ad Creative Testing System.
 * Idea: the ad with the most clicks isn't the winner. Ad A (funny skit, CTR 3.8%, conversion 0.6%) scores 41 → ITERATE;
 *       Ad B (plain demo, CTR 1.4%, conversion 4.1%) scores 84 → SCALE. Sales per 10,000 views: A 2.3 vs B 5.7 (example figures).
 * Timeline (s): 0 hook + two ad cards · 2.5 Ad A punch-in · 3.0–4.6 funnel rows + 3D bars · 5.5 3D gauge → 41 ITERATE
 *               · 7.5 colour flip, Ad B → 84 SCALE · 9.6 debate bubble · 11.6 payoff (3D ring) · 13.0 end card · 15.5 end.
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

export const DAILY_SECONDS = 15.5;

// ---------------- CONFIG (edit per day) ----------------
const CONFIG = {
  hook: ['Your [highest-CTR]', 'ad isn’t your', 'winner.'],
  ads: [
    {id: 'A', name: 'Funny skit', ctr: '3.8%', conv: '0.6%', score: 41, verdict: 'ITERATE', why: 'clicks fine. buyers don’t.'},
    {id: 'B', name: 'Plain demo', ctr: '1.4%', conv: '4.1%', score: 84, verdict: 'SCALE', why: 'fewer clicks. real buyers.'},
  ],
  funnel: [
    {label: 'Hook', v: 78, val: '78', good: true},
    {label: 'Body', v: 70, val: '70', good: true},
    {label: 'Click', v: 88, val: 'CTR 3.8%', good: true},
    {label: 'Conversion', v: 12, val: '0.6%', good: false},
  ],
  captions: [
    {at: 2.5, text: 'Most [clicks]…'}, {at: 3.0, text: 'Score the [funnel]'}, {at: 5.5, text: 'Verdict: [41]'},
    {at: 7.5, text: 'The “boring” ad?'}, {at: 9.6, text: '[Hot] take:'}, {at: 11.6, text: 'Scale [buyers]'},
  ],
  debate: 'A funny ad that\ndoesn’t sell is\njust [content].',
  payoff: {kicker: 'SALES PER 10,000 VIEWS', rows: [{n: 'Ad A · skit', v: '2.3', good: false}, {n: 'Ad B · demo', v: '5.7', good: true}], note: 'CTR × conversion'},
  end: {line1: 'Score the funnel,', line2: 'not just the click.', product: 'Ad Creative Testing System', pillSize: 38},
  t: {focus: 2.5, rows: 3.0, rowGap: 0.4, gauge: 5.5, flip: 7.5, debate: 9.6, payoff: 11.6, end: 13.0},
};
// --------------------------------------------------------

const px = (x: number, y: number): [number, number, number] => [x - 540, 960 - y, 0];
const ROW0 = 560, ROW_GAP = 140;

/** 3D score gauge: dim full track + coloured arc that fills to `score`, gently tilting. */
const Gauge3D: React.FC<{cx: number; cy: number; score: number; fromS: number; color: string; r?: number}> = ({cx, cy, score, fromS, color, r = 250}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const p = easeOut((t - fromS) / 1.0);
  const arc = Math.max(0.01, (Math.PI * 2 * score / 100) * p);
  const [x, y] = px(cx, cy); const tilt: [number, number, number] = [0.32 * Math.sin(t * 1.1), 0.28 * Math.cos(t * 0.9), 0];
  const pop = 1 + 0.06 * (1 - clamp((t - fromS - 1.0) / 0.3)) * (t > fromS + 1.0 ? 1 : 0);
  return (
    <group position={[x, y, -60]} rotation={tilt} scale={pop}>
      <mesh><torusGeometry args={[r, 26, 20, 120]} /><meshStandardMaterial color="#2a2524" metalness={0.2} roughness={0.6} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2 - arc]} position={[0, 0, 8]}>
        <torusGeometry args={[r, 36, 24, 160, arc]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.4} roughness={0.25} />
      </mesh>
    </group>
  );
};

const AdCard: React.FC<{ad: typeof CONFIG.ads[0]; x: number; y: number; w: number; h: number; o: number; s: number; hot?: boolean}> = ({ad, x, y, w, h, o, s, hot}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 32, background: C.panel, border: `4px solid ${hot ? C.red : C.line}`,
    boxShadow: hot ? '0 0 60px rgba(229,56,59,.35)' : 'none', opacity: o, transform: `scale(${s})`, zIndex: 20, overflow: 'hidden'}}>
    {/* fake ad thumbnail */}
    <div style={{position: 'absolute', left: 24, right: 24, top: 24, height: h * 0.48, borderRadius: 20, background: hot ? 'linear-gradient(135deg,#3a1517,#171414)' : 'linear-gradient(135deg,#232020,#171414)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 0, height: 0, borderTop: '34px solid transparent', borderBottom: '34px solid transparent', borderLeft: `56px solid ${C.white}`, opacity: 0.85, marginLeft: 12}} />
    </div>
    <div style={{position: 'absolute', left: 30, top: h * 0.48 + 44, fontSize: 40, fontWeight: 900}}>Ad {ad.id} · <span style={{color: '#b9b0aa'}}>{ad.name}</span></div>
    <div style={{position: 'absolute', left: 30, top: h * 0.48 + 104, fontSize: 30, fontWeight: 800, letterSpacing: 2, color: C.muted}}>CTR</div>
    <div style={{position: 'absolute', left: 30, top: h * 0.48 + 136, fontSize: 104, fontWeight: 900, letterSpacing: -4, lineHeight: 1, color: hot ? C.red : C.white}}>{ad.ctr}</div>
  </div>
);

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const [A, B] = CONFIG.ads;
  // Phase 1 → 2: two cards, then Ad A punches in and shrinks to a header strip
  const focus = easeOut((t - T.focus) / 0.4);
  const toStrip = easeOut((t - T.rows) / 0.4);
  const isB = t >= T.flip;
  const lanes: Lane3D[] = CONFIG.funnel.map((r, i) => ({y: ROW0 + i * ROW_GAP + 96, fromX: 100, maxW: 520, value: r.v, scaleMax: 100,
    startS: T.rows + 0.3 + i * T.rowGap, resultS: T.rows + 0.3 + 3 * T.rowGap + 0.6, good: r.good}));
  const rowsOut = easeOut((t - T.gauge + 0.2) / 0.3);
  const ad = isB ? B : A; const gFrom = isB ? T.flip + 0.3 : T.gauge + 0.1; const gColor = isB ? C.green : C.red;
  const shownScore = Math.round(ad.score * easeOut((t - gFrom) / 1.0));
  const verdictK = backOut((t - gFrom - 1.0) / 0.3);
  const punch = t >= T.focus && t < T.rows ? 1 + 0.05 * Math.sin(clamp((t - T.focus) / 0.5) * Math.PI) : 1;
  const flipFlash = isB ? 1 - clamp((t - T.flip) / 0.25) : 0;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <AbsoluteFill style={{transform: `scale(${punch})`, transformOrigin: '540px 900px'}}>
        <ExampleLabel dim={t >= T.debate && t < T.payoff} />
        <Canvas3D zIndex={1}><Drifters /></Canvas3D>
        <Hook lines={CONFIG.hook} size={104} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />

        {/* Phase 1: two ad cards, visible from frame 1 */}
        {t < T.rows + 0.4 && (<>
          <AdCard ad={A} x={70} y={700} w={430} h={560} hot o={1 - toStrip} s={(1 + 0.08 * focus) * (1 - 0.1 * toStrip)} />
          <AdCard ad={B} x={550} y={700} w={430} h={560} o={(1 - 0.6 * focus) * (1 - toStrip)} s={1 - 0.06 * focus} />
          {t < T.focus + 0.5 && <div style={{position: 'absolute', left: 300, top: 660, background: C.white, color: C.bg, fontSize: 36, fontWeight: 900, padding: '10px 22px', borderRadius: 16,
            zIndex: 30, transform: `rotate(6deg) scale(${backOut((t - 0.4) / 0.3)})`, opacity: 1 - clamp((t - T.focus - 0.3) / 0.2)}}>most clicks</div>}
        </>)}

        {/* Header strip: which ad is being scored */}
        {t >= T.rows && t < T.debate && (
          <div style={{position: 'absolute', left: 70, top: 360, width: 900, height: 130, borderRadius: 26, zIndex: 22, background: isB ? '#10190f' : '#1f1112',
            border: `4px solid ${isB ? C.green : C.red}`, display: 'flex', alignItems: 'center', padding: '0 34px', opacity: toStrip,
            transform: `translateX(${isB ? (1 - easeOut((t - T.flip) / 0.35)) * 900 : 0}px) scale(${0.9 + 0.1 * toStrip})`}}>
            <div style={{fontSize: 52, fontWeight: 900}}>Ad {ad.id} · <span style={{color: '#b9b0aa'}}>{ad.name}</span></div>
            <div style={{marginLeft: 'auto', fontSize: 40, fontWeight: 800, color: C.muted}}>CTR <span style={{color: C.white, fontSize: 52, fontWeight: 900}}>{ad.ctr}</span></div>
          </div>
        )}

        {/* Phase 2: funnel diagnosis rows + 3D bars */}
        {t >= T.rows + 0.3 && rowsOut < 1 && (<>
          {CONFIG.funnel.map((r, i) => {
            const st = T.rows + 0.3 + i * T.rowGap; if (t < st) return null;
            const k = backOut((t - st) / 0.3); const done = t >= lanes[0].resultS;
            return (
              <div key={i} style={{position: 'absolute', left: 70, top: ROW0 + i * ROW_GAP, width: 900, height: 124, borderRadius: 22, zIndex: 5,
                background: done && !r.good ? '#1f1112' : C.panel, border: `3px solid ${done ? (r.good ? C.line : C.red) : C.line}`,
                opacity: clamp((t - st) / 0.12) * (1 - rowsOut), transform: `translateX(${(1 - k) * 160}px) translateY(${rowsOut * -50}px)`}}>
                <div style={{position: 'absolute', left: 30, top: 14, fontSize: 42, fontWeight: 900}}>{r.label}</div>
                <div style={{position: 'absolute', right: 30, top: 28, fontSize: 52, fontWeight: 900, color: done ? (r.good ? C.green : C.red) : C.white}}>
                  {r.val} {done ? (r.good ? '✓' : '✗') : ''}</div>
              </div>
            );
          })}
          {t >= lanes[0].resultS && <div style={{position: 'absolute', left: 70, top: ROW0 + 4 * ROW_GAP + 10, width: 900, textAlign: 'center', zIndex: 30,
            transform: `scale(${backOut((t - lanes[0].resultS) / 0.3)})`, opacity: 1 - rowsOut}}>
            <span style={{background: C.red, color: C.white, fontSize: 46, fontWeight: 900, padding: '14px 30px', borderRadius: 18}}>leak: after the click</span></div>}
          <Canvas3D zIndex={10} opacity={1 - rowsOut}><Bars3D lanes={lanes.filter((l) => t >= l.startS)} /></Canvas3D>
        </>)}

        {/* Phase 3: 3D gauge → verdict (Ad A, then Ad B after the colour flip) */}
        {t >= T.gauge && t < T.debate && (<>
          <Canvas3D zIndex={12}><Gauge3D key={ad.id} cx={540} cy={860} score={ad.score} fromS={gFrom} color={gColor} /></Canvas3D>
          <div style={{position: 'absolute', left: 0, width: 1080, top: 730, textAlign: 'center', zIndex: 24, opacity: clamp((t - T.gauge) / 0.15)}}>
            <div style={{fontSize: 210, fontWeight: 900, letterSpacing: -8, lineHeight: 1, color: gColor, fontVariantNumeric: 'tabular-nums'}}>{shownScore}</div>
            <div style={{fontSize: 40, fontWeight: 800, color: C.muted, marginTop: 4}}>/ 100</div>
          </div>
          {t >= gFrom + 1.0 && (
            <div style={{position: 'absolute', left: 0, width: 1080, top: 1170, textAlign: 'center', zIndex: 26}}>
              <div style={{display: 'inline-block', background: isB ? C.green : C.white, color: C.bg, fontSize: 84, fontWeight: 900, letterSpacing: 2, padding: '12px 46px', borderRadius: 22,
                transform: `rotate(-3deg) scale(${1.6 - 0.6 * verdictK})`, opacity: clamp((t - gFrom - 1.0) / 0.08)}}>{ad.verdict}</div>
              <div style={{fontSize: 42, fontWeight: 800, color: '#cfc7c1', marginTop: 26, opacity: clamp((t - gFrom - 1.2) / 0.2)}}>
                conv. {ad.conv} · {ad.why}</div>
            </div>
          )}
          {flipFlash > 0 && <div style={{position: 'absolute', inset: 0, background: C.green, opacity: 0.35 * flipFlash, zIndex: 35}} />}
        </>)}

        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.payoff} />

        {/* Phase 4: payoff */}
        {t >= T.payoff + 0.1 && t < T.end && (<>
          <Canvas3D zIndex={25}><PayoffRing cx={540} cy={880} fromS={T.payoff + 0.1} toS={T.end} r={370} /></Canvas3D>
          <div style={{position: 'absolute', left: 70, top: 520, width: 900, height: 700, borderRadius: 36, background: 'rgba(16,26,19,.88)', border: `4px solid ${C.green}`,
            boxShadow: '0 0 80px rgba(94,227,143,.35)', textAlign: 'center', paddingTop: 50, zIndex: 30, opacity: clamp((t - T.payoff - 0.1) / 0.2),
            transform: `scale(${0.9 + 0.1 * backOut((t - T.payoff - 0.1) / 0.3)})`}}>
            <div style={{fontSize: 38, fontWeight: 800, letterSpacing: 4, color: C.green}}>{CONFIG.payoff.kicker}</div>
            {CONFIG.payoff.rows.map((r, i) => {
              const at = T.payoff + 0.3 + i * 0.5; if (t < at) return null;
              const k = backOut((t - at) / 0.3);
              return (
                <div key={i} style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 50px 0', transform: `scale(${0.8 + 0.2 * k})`, opacity: clamp((t - at) / 0.1)}}>
                  <div style={{fontSize: 60, fontWeight: 900, color: r.good ? C.white : '#a39a95'}}>{r.n}</div>
                  <div style={{fontSize: r.good ? 150 : 100, fontWeight: 900, letterSpacing: -5, color: r.good ? C.green : C.red, fontVariantNumeric: 'tabular-nums',
                    textShadow: r.good ? '0 0 40px rgba(94,227,143,.45)' : 'none'}}>{r.v}</div>
                </div>
              );
            })}
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
