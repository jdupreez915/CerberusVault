import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../brand';
import {backOut, clamp} from './anim';
// 2–4 word kinetic captions that swap on each beat. Wrap the active word in [brackets].
export type Beat = {at: number; text: string};
export const BeatCaption: React.FC<{beats: Beat[]; until: number; top?: number}> = ({beats, until, top = 190}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const cur = [...beats].reverse().find((b) => t >= b.at);
  if (!cur || t >= until) return null;
  const p = backOut((t - cur.at) / 0.25);
  return (
    <div style={{position: 'absolute', left: 70, top, width: 900, fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.04,
      letterSpacing: -2.5, color: C.white, opacity: clamp((t - cur.at) / 0.12), transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: '0 50%', zIndex: 60}}>
      {cur.text.split(/(\[[^\]]+\])/).map((s, i) => s.startsWith('[') ? <span key={i} style={{color: C.red}}>{s.slice(1, -1)}</span> : <span key={i}>{s}</span>)}
    </div>
  );
};
