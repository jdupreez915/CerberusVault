import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../brand';
import {backOut, clamp} from './anim';
import {Logo} from './Logo';
// The debate line as its own beat. Dims what is behind it. Wrap a phrase in [brackets] for red.
export const CommentBubble: React.FC<{text: string; fromS: number; toS: number; label?: string; top?: number}> = ({text, fromS, toS, label = 'hot take', top = 700}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  if (t < fromS || t >= toS) return null;
  const p = backOut((t - fromS) / 0.3);
  return (<>
    <div style={{position: 'absolute', inset: 0, background: C.bg, opacity: 0.7 * clamp((t - fromS) / 0.2), zIndex: 55}} />
    <div style={{position: 'absolute', left: 90, top, width: 860, background: C.white, color: C.bg, borderRadius: 36, padding: '40px 44px',
      fontFamily: FONT, zIndex: 70, opacity: clamp((t - fromS) / 0.1), transform: `scale(${0.6 + 0.4 * p}) rotate(-1.5deg)`, transformOrigin: '120px 100%'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 34, fontWeight: 800, color: '#5c5552', marginBottom: 18}}>
        <div style={{width: 64, height: 64, borderRadius: '50%', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Logo width={46} /></div>{label}
      </div>
      <div style={{fontSize: 62, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1.5, whiteSpace: 'pre-line'}}>
        {text.split(/(\[[^\]]+\])/).map((s, i) => s.startsWith('[') ? <span key={i} style={{color: C.red}}>{s.slice(1, -1)}</span> : <span key={i}>{s}</span>)}
      </div>
      <div style={{position: 'absolute', left: 70, bottom: -34, width: 0, height: 0, borderLeft: '28px solid ' + C.white, borderRight: '20px solid transparent', borderTop: '24px solid ' + C.white, borderBottom: '20px solid transparent'}} />
    </div>
  </>);
};
