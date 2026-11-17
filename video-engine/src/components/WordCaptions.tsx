import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring} from 'remotion';

// Word-by-word captions with the active word highlighted.
// Swap `captions` for a JSON file from a transcription (e.g. @remotion/install-whisper-cpp).
const Page: React.FC<{tokens: {text: string; fromMs: number; toMs: number}[]; startMs: number}> = ({tokens, startMs}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const nowMs = startMs + (frame / fps) * 1000;
  const s = spring({frame, fps, config: {damping: 14}, durationInFrames: 8});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', top: '-34%'}}>
      <div style={{fontFamily: 'Inter Display, Inter, sans-serif', fontWeight: 900, fontSize: width * 0.09,
        textAlign: 'center', padding: '0 60px', lineHeight: 1.05, color: '#efe8e2', transform: `scale(${0.85 + 0.15 * s})`,
        textShadow: '0 6px 24px rgba(0,0,0,.6)', whiteSpace: 'pre-wrap'}}>
        {tokens.map((t, i) => (
          <span key={i} style={{color: nowMs >= t.fromMs && nowMs < t.toMs ? '#e5383b' : undefined}}>{t.text}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{captions: Caption[]}> = ({captions}) => {
  const {fps} = useVideoConfig();
  const {pages} = createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: 900});
  return (
    <AbsoluteFill>
      {pages.map((p, i) => {
        const next = pages[i + 1]?.startMs ?? p.startMs + p.durationMs;
        const from = Math.round((p.startMs / 1000) * fps);
        const dur = Math.max(1, Math.round(((next - p.startMs) / 1000) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Page tokens={p.tokens} startMs={p.startMs} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
