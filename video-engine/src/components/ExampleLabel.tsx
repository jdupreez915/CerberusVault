import {C, FONT} from '../brand';
// Show whenever numbers are on screen.
export const ExampleLabel: React.FC<{dim?: boolean}> = ({dim}) => (
  <div style={{position: 'absolute', left: 70, top: 70, fontFamily: FONT, fontSize: 30, fontWeight: 800, letterSpacing: 3,
    color: C.bg, background: C.white, padding: '10px 18px', borderRadius: 10, opacity: dim ? 0.4 : 1, zIndex: 50}}>EXAMPLE FIGURES</div>
);
