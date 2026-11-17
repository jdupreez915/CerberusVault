import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, HANDLE} from '../brand';
import {backOut, clamp, easeOut} from './anim';
import {Logo} from './Logo';
// Last ~2.5 s: logo, two-line statement (second line red), pulsing pill "<product> · link in bio ➜", handle.
export const EndCard: React.FC<{fromS: number; line1: string; line2: string; product: string}> = ({fromS, line1, line2, product}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const et = frame / fps - fromS;
  if (et < 0) return null;
  const pulse = et > 0.5 ? (Math.sin((et - 0.5) * Math.PI * 2) + 1) / 2 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.bg, opacity: clamp(et / 0.2), fontFamily: FONT, color: C.white, zIndex: 100}}>
      <Logo width={300} style={{position: 'absolute', left: 390, top: 260, transform: `scale(${0.7 + 0.3 * backOut(et / 0.35)})`}} />
      <div style={{position: 'absolute', left: 60, width: 960, top: 560, textAlign: 'center', fontSize: 92, fontWeight: 900, letterSpacing: -2.5,
        lineHeight: 1.05, transform: `translateY(${40 * (1 - easeOut((et - 0.1) / 0.35))}px)`}}>{line1}<br /><span style={{color: C.red}}>{line2}</span></div>
      <div style={{position: 'absolute', left: '50%', top: 880, whiteSpace: 'nowrap', background: C.red, color: C.white, fontSize: 50, fontWeight: 800,
        padding: '30px 52px', borderRadius: 999, transform: `translateX(-50%) scale(${(et < 0.3 ? 0.8 + 0.2 * backOut(et / 0.3) : 1) + 0.05 * pulse})`,
        boxShadow: `0 0 ${10 + 40 * pulse}px rgba(229,56,59,${0.3 + 0.4 * pulse})`}}>
        {product} · link in bio <span style={{display: 'inline-block', transform: `translateX(${12 * pulse}px)`}}>➜</span></div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1060, textAlign: 'center', fontSize: 44, fontWeight: 700, color: '#b9b0aa'}}>{HANDLE}</div>
    </div>
  );
};
