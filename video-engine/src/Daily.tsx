/**
 * DAILY VIDEO — 2026-11-22 · format C (product demo) · Influencer & UGC Outreach CRM.
 * Idea: creators "ghosting" you is usually a follow-up nobody sent. The CRM's queue puts overdue creators first,
 *       a template builds the follow-up, and the discount code tells you whether to Rebook (example deal: 26 orders, 3.07x ROAS).
 * Timeline (s): 0 hook + stale DM list · 1.2 NO FOLLOW-UP stamp · 2.4 DMs scatter, "No system." · 3.1 queue panel slides in (shuffled)
 *               · 4.1 re-sort: overdue first · 5.6 punch-in on row 1 + message builder slides up · 7.1 "Copied ✓" + row turns green
 *               · 8.2 debate bubble · 10.2 payoff deal card + 3D ring · 11.1 REBOOK stamp · 12.5 end card · 15.0 end.
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

export const DAILY_SECONDS = 15;

// ---------------- CONFIG (edit per day) ----------------
const CONFIG = {
  hook: ['Creators didn’t', '[ghost] you.', 'You forgot.'],
  dms: [
    {h: '@mia.makes', msg: 'Sample arrived! 📦', ago: '9d'},
    {h: '@dan.fits', msg: 'Can you send the brief?', ago: '7d'},
    {h: '@lena.home', msg: 'Posted it 🙌', ago: '5d'},
    {h: '@ro.cooks', msg: 'What’s the rate?', ago: '4d'},
  ],
  // sorted order = overdue first
  queue: [
    {h: '@mia.makes', stage: 'Sample delivered', badge: 'OVERDUE 4d', kind: 'over'},
    {h: '@dan.fits', stage: 'Asked for brief', badge: 'OVERDUE 2d', kind: 'over'},
    {h: '@lena.home', stage: 'Posted · check code', badge: 'DUE TODAY', kind: 'today'},
    {h: '@ro.cooks', stage: 'Rate sent', badge: 'in 2 days', kind: 'later'},
    {h: '@jt.style', stage: 'First DM', badge: 'in 5 days', kind: 'later'},
  ],
  shuffled: [3, 0, 4, 2, 1], // index of queue row shown in each slot before the sort
  template: {tag: 'TEMPLATE 4 / 10 · FOLLOW-UP AFTER SAMPLE', msg: 'Hey Mia, did the sample land OK? Here’s the brief + your code MIA15 whenever you’re ready to post.'},
  captions: [
    {at: 2.3, text: 'No [system].'}, {at: 2.8, text: 'One [queue].'}, {at: 3.9, text: 'Overdue [first].'},
    {at: 5.6, text: 'Template [ready].'}, {at: 8.2, text: '[Hot] take:'}, {at: 10.2, text: 'Code [tracked].'},
  ],
  debate: 'No reply to one DM\nisn’t a “no”.\n[It’s a missing follow-up.]',
  payoff: {handle: '@mia.makes · code MIA15', stats: [{v: '26', l: 'orders'}, {v: '3.07×', l: 'ROAS'}], verdicts: ['REBOOK', 'TEST AGAIN', 'DROP']},
  end: {line1: 'Never lose a', line2: 'creator again.', product: 'Influencer & UGC CRM', pillSize: 46},
  t: {stamp: 1.2, scatter: 2.3, panel: 2.7, sort: 3.9, build: 5.6, copied: 7.1, debate: 8.2, payoff: 10.2, verdict: 11.1, end: 12.5},
};
// --------------------------------------------------------

const PANEL_TOP = 350, ROW0 = PANEL_TOP + 130, ROW_GAP = 150, ROW_H = 132;
const badgeStyle = (kind: string, done: boolean): React.CSSProperties => done
  ? {background: C.green, color: C.bg}
  : kind === 'over' ? {background: C.red, color: C.white} : kind === 'today' ? {background: C.white, color: C.bg} : {background: '#2a2524', color: C.muted};

/** Hook visual: stale DM list, visible from frame 1, then a NO FOLLOW-UP stamp and a scatter. */
const StaleDMs: React.FC<{t: number}> = ({t}) => {
  const T = CONFIG.t; const sc = clamp((t - T.scatter) / 0.5); if (sc >= 1) return null;
  const stamp = t >= T.stamp ? backOut((t - T.stamp) / 0.25) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20}}>
      {CONFIG.dms.map((d, i) => {
        const fall = easeOut(sc); const dir = i % 2 ? 1 : -1;
        return (
          <div key={i} style={{position: 'absolute', left: 70, top: 600 + i * 150, width: 900, height: 128, borderRadius: 28, background: C.panel,
            border: `3px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px', opacity: 1 - fall,
            transform: `translate(${dir * 260 * fall}px, ${420 * fall * fall}px) rotate(${dir * 18 * fall}deg)`}}>
            <div style={{width: 76, height: 76, borderRadius: '50%', background: i % 2 ? '#3a3433' : '#5a3b3c', flexShrink: 0}} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 30, fontWeight: 700, color: C.muted}}>{d.h}</div>
              <div style={{fontSize: 40, fontWeight: 800}}>{d.msg}</div>
            </div>
            <div style={{fontSize: 30, fontWeight: 700, color: C.muted, textAlign: 'right'}}>unanswered<br /><span style={{color: C.red, fontSize: 40, fontWeight: 900}}>{d.ago}</span></div>
          </div>
        );
      })}
      {stamp > 0 && <div style={{position: 'absolute', left: 170, top: 800, zIndex: 25, fontSize: 104, fontWeight: 900, letterSpacing: -2, color: C.red,
        border: `10px solid ${C.red}`, borderRadius: 24, padding: '6px 32px', background: 'rgba(10,9,9,.82)', opacity: clamp(stamp * 2) * (1 - sc),
        transform: `rotate(-8deg) scale(${2.2 - 1.2 * stamp})`}}>NO FOLLOW-UP</div>}
    </div>
  );
};

export const Daily: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const T = CONFIG.t;
  const panelIn = easeOut((t - T.panel) / 0.4);
  const sortP = easeOut((t - T.sort) / 0.6);
  const buildP = easeOut((t - T.build) / 0.4);
  const zoom = t >= T.build && t < T.debate ? 1 + 0.06 * easeOut((t - T.build) / 0.35) : 1;
  const copied = t >= T.copied;
  const showPanel = t >= T.panel && t < T.debate;
  const chars = Math.floor(CONFIG.template.msg.length * clamp((t - T.build - 0.35) / 1.0));
  const press = copied ? 1 - 0.08 * (1 - clamp((t - T.copied) / 0.2)) : 1;
  const verdict = t >= T.verdict ? backOut((t - T.verdict) / 0.3) : 0;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.white}}>
      <Canvas3D zIndex={1}><Drifters /></Canvas3D>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `540px ${ROW0}px`}}>
        <ExampleLabel dim={t >= T.debate && t < T.payoff} />
        <Hook lines={CONFIG.hook} outAtS={2.2} />
        <StaleDMs t={t} />
        <BeatCaption beats={CONFIG.captions} until={T.end} />
        {showPanel && (
          <div style={{position: 'absolute', left: 70, top: PANEL_TOP, width: 900, height: 900, borderRadius: 36, background: 'rgba(23,20,20,.94)',
            border: `3px solid ${C.line}`, zIndex: 15, opacity: clamp((t - T.panel) / 0.15), transform: `translateX(${(1 - panelIn) * 700}px)`}}>
            <div style={{position: 'absolute', left: 34, top: 30, fontSize: 44, fontWeight: 900}}>Follow-up queue</div>
            <div style={{position: 'absolute', right: 34, top: 40, fontSize: 30, fontWeight: 700, color: C.muted}}>18 creators</div>
          </div>
        )}
        {showPanel && CONFIG.queue.map((q, qi) => {
          const slotBefore = CONFIG.shuffled.indexOf(qi); const slot = slotBefore + (qi - slotBefore) * sortP;
          const done = qi === 0 && copied; const hi = qi === 0 && t >= T.build;
          const hidden = qi >= 2 ? buildP : 0;
          return (
            <div key={qi} style={{position: 'absolute', left: 100, top: ROW0 + slot * ROW_GAP, width: 840, height: ROW_H, borderRadius: 24, zIndex: 16,
              background: hi ? '#1f1112' : '#100e0e', border: `3px solid ${done ? C.green : hi ? C.red : C.line}`,
              boxShadow: hi ? `0 0 50px ${done ? 'rgba(94,227,143,.35)' : 'rgba(229,56,59,.4)'}` : 'none',
              opacity: clamp((t - T.panel - 0.15 - qi * 0.06) / 0.15) * (1 - hidden), transform: `translateX(${(1 - easeOut((t - T.panel - qi * 0.06) / 0.4)) * 700}px)`}}>
              <div style={{position: 'absolute', left: 28, top: 18, fontSize: 42, fontWeight: 900}}>{q.h}</div>
              <div style={{position: 'absolute', left: 28, top: 74, fontSize: 30, fontWeight: 700, color: C.muted}}>{q.stage}</div>
              <div style={{position: 'absolute', right: 26, top: 38, fontSize: 32, fontWeight: 900, letterSpacing: 1, padding: '10px 20px', borderRadius: 14,
                ...badgeStyle(q.kind, done), transform: done ? `scale(${backOut((t - T.copied) / 0.3)})` : undefined}}>{done ? 'FOLLOWED UP ✓' : q.badge}</div>
            </div>
          );
        })}
        {showPanel && t >= T.build && (
          <div style={{position: 'absolute', left: 100, top: ROW0 + 3 * ROW_GAP - 120, width: 840, height: 410, borderRadius: 30, background: C.white, color: C.bg,
            zIndex: 18, padding: '28px 34px', transform: `translateY(${(1 - buildP) * 600}px)`, opacity: clamp((t - T.build) / 0.15), boxShadow: '0 -20px 60px rgba(0,0,0,.6)'}}>
            <div style={{fontSize: 26, fontWeight: 800, letterSpacing: 2, color: '#5c5552'}}>{CONFIG.template.tag}</div>
            <div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.25, marginTop: 16, height: 190}}>{CONFIG.template.msg.slice(0, chars)}
              {chars < CONFIG.template.msg.length && <span style={{display: 'inline-block', width: 4, height: 40, background: C.red, verticalAlign: 'middle', marginLeft: 3}} />}</div>
            <div style={{position: 'absolute', left: 34, bottom: 28, fontSize: 36, fontWeight: 900, padding: '16px 34px', borderRadius: 999,
              background: copied ? C.green : C.red, color: copied ? C.bg : C.white, transform: `scale(${press})`}}>{copied ? 'Copied ✓' : 'Copy message'}</div>
            <div style={{position: 'absolute', right: 34, bottom: 40, fontSize: 28, fontWeight: 700, color: '#5c5552'}}>next follow-up: auto-dated</div>
          </div>
        )}
        <CommentBubble text={CONFIG.debate} fromS={T.debate} toS={T.payoff} />
        {t >= T.payoff && t < T.end && (<>
          <Canvas3D zIndex={25}><PayoffRing cx={540} cy={820} fromS={T.payoff + 0.1} toS={T.end} r={480} /></Canvas3D>
          <div style={{position: 'absolute', left: 70, top: 360, width: 900, height: 860, borderRadius: 36, background: 'rgba(16,26,19,.88)', border: `4px solid ${C.green}`,
            boxShadow: '0 0 80px rgba(94,227,143,.3)', textAlign: 'center', paddingTop: 44, zIndex: 30, opacity: clamp((t - T.payoff) / 0.2),
            transform: `scale(${0.9 + 0.1 * backOut((t - T.payoff) / 0.3)})`}}>
            <div style={{fontSize: 40, fontWeight: 800, letterSpacing: 1, color: C.green}}>{CONFIG.payoff.handle}</div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 90, marginTop: 40}}>
              {CONFIG.payoff.stats.map((s, i) => {
                const k = backOut((t - T.payoff - 0.25 - i * 0.2) / 0.3);
                return (<div key={i} style={{transform: `scale(${k})`}}>
                  <div style={{fontSize: 150, fontWeight: 900, letterSpacing: -6, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{s.v}</div>
                  <div style={{fontSize: 40, fontWeight: 700, color: '#cfc7c1'}}>{s.l}</div>
                </div>);
              })}
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 18, marginTop: 70}}>
              {CONFIG.payoff.verdicts.map((v, i) => (
                <div key={i} style={{fontSize: i === 0 ? 60 : 32, fontWeight: 900, padding: i === 0 ? '20px 40px' : '14px 22px', borderRadius: 18, alignSelf: 'center',
                  background: i === 0 && verdict > 0 ? C.green : 'transparent', color: i === 0 && verdict > 0 ? C.bg : '#6f6763',
                  border: `3px solid ${i === 0 && verdict > 0 ? C.green : '#3a3433'}`, opacity: i === 0 ? 1 : 1 - 0.5 * clamp(verdict),
                  transform: i === 0 ? `scale(${verdict > 0 ? 0.7 + 0.3 * verdict : 0.9}) rotate(${-3 * clamp(verdict)}deg)` : undefined,
                  boxShadow: i === 0 && verdict > 0 ? '0 0 60px rgba(94,227,143,.6)' : 'none'}}>{v}</div>
              ))}
            </div>
            <div style={{fontSize: 30, fontWeight: 700, color: C.muted, marginTop: 50}}>verdict from the code’s orders, not follower count</div>
          </div>
        </>)}
      </AbsoluteFill>
      <EndCard fromS={T.end} {...CONFIG.end} />
    </AbsoluteFill>
  );
};
