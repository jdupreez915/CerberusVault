import {Img, staticFile} from 'remotion';
// Official red three-headed-dog mark (extracted from the site favicon). Never redraw it.
export const Logo: React.FC<{width: number; style?: React.CSSProperties}> = ({width, style}) => (
  <Img src={staticFile('logo.svg')} style={{width, height: 'auto', ...style}} />
);
