import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../brand';
import {easeOut, clamp} from './anim';
// Frame-1-readable hook: no fade-in. The red power word gets an underline that pops in by 0.3 s.
// `lines` are plain strings; wrap the power word in [brackets], e.g. ["Running ads at", "[1.6 ROAS?]"].
export const Hook: React.FC<{lines: string[]; outAtS?: number; top?: number; size?: number}> = ({lines, outAtS = 2.3, top = 150, size = 118}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const u = easeOut(t / 0.3); const o = t < outAtS ? 1 : 1 - clamp((t - outAtS) / 0.2);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 70, top, width: 900, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.02,
      letterSpacing: -3, color: C.white, opacity: o, transform: `translateY(${-30 * (1 - o)}px)`, zIndex: 40}}>
      {lines.map((l, i) => (
        <div key={i}>{l.split(/(\[[^\]]+\])/).map((part, j) => part.startsWith('[') ? (
          <span key={j} style={{color: C.red, position: 'relative', display: 'inline-block'}}>{part.slice(1, -1)}
            <span style={{position: 'absolute', left: 0, bottom: -6, height: 16, width: `${100 * u}%`, background: C.red, borderRadius: 8}} /></span>
        ) : <span key={j}>{part}</span>)}</div>
      ))}
    </div>
  );
};
