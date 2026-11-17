import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../brand';
import {easeOut, backOut, clamp} from './anim';

// Orthographic camera at zoom 1 => 1 three.js unit = 1 CSS pixel, so 3D objects line up with the HTML layout.
// px(x, y) converts top-left page pixels to scene coordinates.
const px = (x: number, y: number, W = 1080, H = 1920): [number, number, number] => [x - W / 2, H / 2 - y, 0];

export type Lane3D = {y: number; fromX: number; maxW: number; value: number; scaleMax: number; startS: number; resultS: number; good: boolean};

const Bar: React.FC<{lane: Lane3D}> = ({lane}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const p = easeOut((t - lane.startS) / 0.7);
  const w = Math.max(1, (lane.value / lane.scaleMax) * lane.maxW * p);
  const done = t >= lane.resultS;
  const color = done ? (lane.good ? C.green : C.red) : C.white;
  const pop = done ? 1 + 0.25 * (1 - clamp((t - lane.resultS) / 0.4)) : 1;
  const [x, y] = px(lane.fromX + w / 2, lane.y);
  return (
    <mesh position={[x, y, 30]} rotation={[-0.35, 0.12 * Math.sin(t * 1.3 + lane.y), 0]} scale={[1, pop, pop]}>
      <boxGeometry args={[w, 30, 22]} />
      <meshStandardMaterial color={color} emissive={done ? color : '#000000'} emissiveIntensity={done ? 0.25 : 0} metalness={0.3} roughness={0.3} />
    </mesh>
  );
};

/** Decorative low-poly shapes drifting behind the layout (all frame-driven). */
const Drifters: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const seeds = [[180, 520, 70], [930, 600, 50], [860, 1500, 90], [150, 1600, 60], [560, 1750, 40]];
  return (<>{seeds.map(([sx, sy, r], i) => {
    const [x, y] = px(sx + 20 * Math.sin(t * 0.7 + i), sy + 25 * Math.cos(t * 0.6 + i * 2));
    return (<mesh key={i} position={[x, y, -200]} rotation={[t * 0.4 + i, t * 0.5 + i, 0]}>
      <icosahedronGeometry args={[r, 0]} />
      <meshStandardMaterial color={i % 2 ? C.red : '#3a3433'} flatShading transparent opacity={0.35} />
    </mesh>);
  })}</>);
};

/** Spinning green ring for a payoff number (centre in page pixels). */
export const PayoffRing: React.FC<{cx: number; cy: number; fromS: number; toS: number; r?: number}> = ({cx, cy, fromS, toS, r = 230}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  if (t < fromS || t >= toS) return null;
  const s = backOut((t - fromS) / 0.4); const [x, y] = px(cx, cy);
  return (<mesh position={[x, y, -100]} rotation={[0.9, t * 2, 0]} scale={s}>
    <torusGeometry args={[r, 14, 24, 96]} />
    <meshStandardMaterial color={C.green} emissive={C.green} emissiveIntensity={0.4} metalness={0.5} roughness={0.2} />
  </mesh>);
};

export const Canvas3D: React.FC<{children?: React.ReactNode; zIndex?: number; opacity?: number}> = ({children, zIndex = 10, opacity = 1}) => {
  const {width, height} = useVideoConfig();
  return (
    <div style={{position: 'absolute', inset: 0, zIndex, opacity, pointerEvents: 'none'}}>
      <ThreeCanvas width={width} height={height} orthographic camera={{zoom: 1, position: [0, 0, 1000], near: 0.1, far: 5000}} gl={{alpha: true}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[300, 800, 900]} intensity={2.4} />
        <pointLight position={[-400, -300, 600]} intensity={4} distance={0} decay={0} color={C.red} />
        {children}
      </ThreeCanvas>
    </div>
  );
};

export const Bars3D: React.FC<{lanes: Lane3D[]}> = ({lanes}) => <>{lanes.map((l, i) => <Bar key={i} lane={l} />)}</>;
export {Drifters};
