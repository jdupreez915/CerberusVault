// sets/office.js — Sam's home office at night: tall window with a lit skyline, desk + glowing laptop, shelves of product boxes.
// Key light = the laptop screen (cool) + city glow through the window. Value structure: dark walls, window + screen are the accents.
import { E, V, mood, layer, rr, seg, circle, linGrad, glow, alpha, shade } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const officeGround = () => E.H * V(0.8, 0.68);
export function office(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = officeGround(), CX = E.W / 2;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.dark, -0.2), shade(M.wall, -0.35)]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    const wx = CX - V(420, 330), wy = GY - V(620, 1080), ww = V(840, 660), wh = V(420, 700);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 3, rows: 2, frame: shade(M.wall, -0.6), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h);
      FX.stars(g, t, { area: [x, y, w, h * 0.5], count: 50, seed: 3 });
      FX.moon(g, x + w * 0.2, y + h * 0.32, 22);
      FX.skyline(g, { x, y: y + h, w, maxH: h * 0.55, color: alpha(shade(M.wall, -0.3), 0.9), windowColor: alpha(M.practical, 0.85), lit: 0.35, seed: 12 });
    });
    glow(g, CX, wy + wh * 0.7, ww * 0.7, M.practical, 0.12);
    // shelves with product boxes on the left wall
    const sx = CX - V(820, 500), sy = GY - V(520, 640);
    for (let r = 0; r < 3; r++) {
      const yy = sy + r * V(150, 170); g.fillStyle = shade(M.wall, -0.6); g.fillRect(sx - 20, yy, V(260, 200), 10);
      for (let k = 0; k < 3; k++) { const bw = V(62, 52), bh = V(56, 48) + (k % 2) * 12; rr(g, sx + k * V(78, 62), yy - bh, bw, bh, 4); g.fillStyle = k % 2 ? '#8a6a4a' : '#6e5238'; g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(sx + k * V(78, 62), yy - bh, bw, 6); }
    }
  });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, [shade(M.floor, -0.15), shade(M.dark, -0.3)]); g.fillRect(-E.W * 1.5, GY, E.W * 4, E.H * 2);
    FX.floorLines(g, GY, GY + 700, 'rgba(0,0,0,.25)', 0.07);
  });
  return { GY, CX, M };
}
// desk with laptop; returns the screen centre. dx shifts the desk.
export function desk(g, x, GY, t, o = {}) {
  const top = GY - 150, c = o.color || '#17121c', glowC = o.glow || '#8fd6ff';
  rr(g, x - 170, top - 14, 340, 18, 6); g.fillStyle = c; g.fill();
  seg(g, [[x - 150, top], [x - 150, GY]], 10, c); seg(g, [[x + 150, top], [x + 150, GY]], 10, c);
  // laptop (screen faces left, toward Sam)
  const lx = x - 40, ly = top - 14;
  g.fillStyle = '#0d0b12'; g.fillRect(lx - 70, ly - 6, 140, 6);
  g.save(); g.translate(lx + 60, ly - 6); g.rotate(-0.18); rr(g, -8, -100, 12, 100, 3); g.fillStyle = '#0d0b12'; g.fill(); g.restore();
  glow(g, lx + 20, ly - 50, 230, glowC, 0.35 + 0.05 * Math.sin(t * 7));
  FX.pool(g, x - 60, GY + 10, 260, 40, glowC, 0.2);
  return { sx: lx + 10, sy: ly - 60, top: ly };
}
