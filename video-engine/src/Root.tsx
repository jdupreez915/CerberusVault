import {Composition} from 'remotion';
import {Daily, DAILY_SECONDS} from './Daily';
import {Pin} from './Pin';
import {DemoScene3D} from './components/DemoScene3D';
import {FPS} from './brand';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Daily" component={Daily} durationInFrames={Math.round(DAILY_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Pin" component={Pin} durationInFrames={1} fps={FPS} width={1000} height={1500} />
    {/* Sandbox: plain perspective 3D scene for trying ideas */}
    <Composition id="Demo3D" component={() => <DemoScene3D color="#e5383b" />} durationInFrames={240} fps={FPS} width={1080} height={1920} />
  </>
);
