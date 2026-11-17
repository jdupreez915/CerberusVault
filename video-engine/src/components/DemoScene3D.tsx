import {ThreeCanvas} from '@remotion/three';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RoundedBox} from '@react-three/drei';

// Everything animates from useCurrentFrame() so each frame renders deterministically.
// Never use useFrame()/clock time from react-three-fiber for motion.
export const DemoScene3D: React.FC<{color: string}> = ({color}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 12}});
  const rot = interpolate(frame, [0, 240], [0, Math.PI * 2]);
  return (
    <ThreeCanvas width={width} height={height} camera={{position: [0, 0, 7.5], fov: 50}}>
      <color attach="background" args={['#0a0909']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#e5383b" />
      <group scale={pop} rotation={[rot * 0.6, rot, 0]}>
        <RoundedBox args={[2, 2, 2]} radius={0.25} smoothness={6}>
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.25} />
        </RoundedBox>
      </group>
      {[...Array(3)].map((_, i) => {
        const a = rot * 1.5 + (i * Math.PI * 2) / 3;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0]} scale={pop * 0.35}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#efe8e2" flatShading />
          </mesh>
        );
      })}
    </ThreeCanvas>
  );
};
