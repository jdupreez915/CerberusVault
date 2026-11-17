/** Pinterest pin 1000x1500 — rendered as a still. The scheduled task edits PIN per day. */
import {AbsoluteFill} from 'remotion';
import {C, FONT} from './brand';
import {Logo} from './components/Logo';

const PIN = {
  example: true,
  title: ['Is [1.6 ROAS]', 'actually profitable?'],
  sub: '$39.99 sale − $15.86 costs = $24.13 left for ads',
  rows: [
    {label: 'ROAS 1.4', value: '−$4.43 / order', note: 'ads $28.56 per order · loss', good: false},
    {label: 'ROAS 1.6', value: '−$0.86 / order', note: 'ads $24.99 per order · loss', good: false},
    {label: 'ROAS 2.0', value: '+$4.13 / order', note: 'ads $20.00 per order · profit', good: true},
  ],
  box: {kicker: 'BREAK-EVEN ROAS', value: '1.66', right: '$39.99 ÷ $24.13\nbelow it, each order loses'},
  footer: 'Store Profit OS · example figures',
};

const red = (s: string) => s.split(/(\[[^\]]+\])/).map((p, i) => p.startsWith('[') ? <span key={i} style={{color: C.red}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>);

export const Pin: React.FC = () => (
  <AbsoluteFill style={{background: C.bg, color: C.white, fontFamily: FONT}}>
    {PIN.example && <div style={{position: 'absolute', left: 60, top: 56, fontSize: 24, fontWeight: 800, letterSpacing: 3, background: C.white, color: C.bg, padding: '8px 14px', borderRadius: 8}}>EXAMPLE FIGURES</div>}
    <div style={{position: 'absolute', left: 60, top: 120, width: 880, fontSize: 96, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3}}>{PIN.title.map((l, i) => <div key={i}>{red(l)}</div>)}</div>
    <div style={{position: 'absolute', left: 60, top: 345, fontSize: 34, fontWeight: 600, color: '#b9b0aa'}}>{PIN.sub}</div>
    {PIN.rows.map((r, i) => (
      <div key={i} style={{position: 'absolute', left: 60, top: 430 + i * 180, width: 880, height: 150, borderRadius: 24, padding: '26px 32px',
        border: `3px solid ${r.good ? C.green : C.red}`, background: r.good ? '#101a13' : '#1f1112', boxShadow: r.good ? '0 0 50px rgba(94,227,143,.35)' : 'none'}}>
        <div style={{fontSize: 50, fontWeight: 900}}>{r.label}</div>
        <div style={{position: 'absolute', right: 32, top: 26, fontSize: 48, fontWeight: 800, color: r.good ? C.green : C.red}}>{r.value}</div>
        <div style={{fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 6}}>{r.note}</div>
      </div>
    ))}
    <div style={{position: 'absolute', left: 60, top: 1000, width: 880, height: 240, borderRadius: 28, background: C.white, color: C.bg, padding: '34px 40px'}}>
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
