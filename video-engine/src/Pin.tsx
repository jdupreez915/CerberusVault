/** Pinterest pin 1000x1500 — rendered as a still. The scheduled task edits PIN per day. */
import {AbsoluteFill} from 'remotion';
import {C, FONT} from './brand';
import {Logo} from './components/Logo';

const PIN = {
  example: true,
  title: ['Your bank balance', 'isn’t your [budget].'],
  sub: '13-week cash forecast (example store)',
  rows: [
    {label: 'Weeks 1–6 · +$500 a week', value: '$10,700', note: 'looks safe from the bank app', good: true},
    {label: 'Week 7 · stock reorder', value: '−$1,240', note: '$12,440 reorder lands in one week', good: false},
    {label: 'Weeks 8–9 · still below $0', value: '−$240', note: 'ads, refunds and fees keep going out', good: false},
    {label: 'Fix · split the reorder', value: 'W7 + W10', note: '$6,220 each, same stock', good: true},
  ],
  box: {kicker: 'LOWEST WEEK AFTER THE SPLIT', value: '+$260', right: 'never below $0\nsee it 6 weeks early'},
  footer: 'Ecom Operating System · example figures',
};

const red = (s: string) => s.split(/(\[[^\]]+\])/).map((p, i) => p.startsWith('[') ? <span key={i} style={{color: C.red}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>);

export const Pin: React.FC = () => (
  <AbsoluteFill style={{background: C.bg, color: C.white, fontFamily: FONT}}>
    {PIN.example && <div style={{position: 'absolute', left: 60, top: 56, fontSize: 24, fontWeight: 800, letterSpacing: 3, background: C.white, color: C.bg, padding: '8px 14px', borderRadius: 8}}>EXAMPLE FIGURES</div>}
    <div style={{position: 'absolute', left: 60, top: 120, width: 880, fontSize: 96, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3}}>{PIN.title.map((l, i) => <div key={i}>{red(l)}</div>)}</div>
    <div style={{position: 'absolute', left: 60, top: 345, fontSize: 34, fontWeight: 600, color: '#b9b0aa'}}>{PIN.sub}</div>
    {PIN.rows.map((r, i) => (
      <div key={i} style={{position: 'absolute', left: 60, top: 425 + i * 140, width: 880, height: 124, borderRadius: 24, padding: '18px 30px',
        border: `3px solid ${r.good ? C.line : C.red}`, background: r.good ? C.panel : '#1f1112', boxShadow: r.good ? 'none' : '0 0 50px rgba(229,56,59,.4)'}}>
        <div style={{fontSize: 42, fontWeight: 900}}>{r.label}</div>
        <div style={{position: 'absolute', right: 30, top: 20, fontSize: 42, fontWeight: 800, color: r.good ? C.white : C.red}}>{r.value}</div>
        <div style={{fontSize: 26, fontWeight: 700, color: C.muted, marginTop: 4}}>{r.note}</div>
      </div>
    ))}
    <div style={{position: 'absolute', left: 60, top: 1015, width: 880, height: 240, borderRadius: 28, background: C.white, color: C.bg, padding: '34px 40px'}}>
      <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 3, color: '#5c5552'}}>{PIN.box.kicker}</div>
      <div style={{fontSize: 120, fontWeight: 900, letterSpacing: -4, lineHeight: 1.05}}>{PIN.box.value}</div>
      <div style={{position: 'absolute', right: 40, top: 96, fontSize: 34, fontWeight: 700, textAlign: 'right', color: '#5c5552', lineHeight: 1.3, whiteSpace: 'pre-line'}}>{PIN.box.right}</div>
    </div>
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 60, borderTop: `2px solid ${C.line}`, paddingTop: 28, display: 'flex', alignItems: 'center', gap: 22}}>
      <Logo width={84} />
      <div><div style={{fontSize: 32, fontWeight: 800}}>{PIN.footer}</div><div style={{fontSize: 28, fontWeight: 600, color: '#b9b0aa', marginTop: 4}}>cerberusvault.gumroad.com</div></div>
    </div>
  </AbsoluteFill>
);
