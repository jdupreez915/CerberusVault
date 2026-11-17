// sets/warehouse.js — small fulfilment room at night: roller door, metal shelving with boxes, hanging lamp (key light), packing table.
import { E, V, mood, layer, rr, seg, circle, linGrad, glow, alpha, shade } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
export function warehouse(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), GY = E.H * V(0.8, 0.68), CX = E.W / 2;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.dark, -0.3), shade(M.wall, -0.4)]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    const dx = CX + V(80, 60), dw = V(520, 460), dh = V(520, 640);              // roller door, slightly open with night light under it
    g.fillStyle = shade(M.wall, -0.55); g.fillRect(dx - dw / 2, GY - dh, dw, dh);
    for (let y = GY - dh + 14; y < GY - 60; y += 22) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(dx - dw / 2, y, dw, 3); }
    g.fillStyle = linGrad(g, 0, GY - 60, 0, GY, [alpha(M.practical, 0.2), alpha(M.practical, 0.6)]); g.fillRect(dx - dw / 2, GY - 60, dw, 60);
    for (const sx of [CX - V(700, 470), CX + V(520, 380)]) {                  // shelving units
      for (let r = 0; r < 4; r++) { const yy = GY - 40 - r * V(150, 170); g.fillStyle = shade(M.wall, -0.65); g.fillRect(sx - 130, yy, 260, 10);
        for (let k = 0; k < 3; k++) { const bh = 70 + ((k + r) % 2) * 22; rr(g, sx - 115 + k * 80, yy - bh, 68, bh, 4); g.fillStyle = (k + r) % 2 ? '#8a6a4a' : '#6e5238'; g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(sx - 115 + k * 80, yy - bh, 68, 7); } }
      seg(g, [[sx - 130, GY], [sx - 130, GY - V(640, 720)]], 8, shade(M.wall, -0.7)); seg(g, [[sx + 130, GY], [sx + 130, GY - V(640, 720)]], 8, shade(M.wall, -0.7));
    }
  });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, [shade(M.floor, -0.1), shade(M.dark, -0.3)]); g.fillRect(-E.W * 1.5, GY, E.W * 4, E.H * 2);
    FX.floorLines(g, GY, GY + 700, 'rgba(0,0,0,.25)', 0.07);
    const lx = CX - V(60, 40), ly = GY - V(620, 760);                         // hanging lamp + cone
    seg(g, [[lx, -E.H], [lx, ly]], 3, '#120e14'); g.fillStyle = '#120e14'; g.beginPath(); g.moveTo(lx - 40, ly + 30); g.lineTo(lx + 40, ly + 30); g.lineTo(lx + 18, ly); g.lineTo(lx - 18, ly); g.closePath(); g.fill();
    glow(g, lx, ly + 34, 90, M.key, 0.9); FX.lightCone(g, lx, ly + 30, { angle: Math.PI / 2, spread: 0.9, len: V(700, 820), color: M.key, a: 0.2 }); FX.pool(g, lx, GY + 10, 300, 50, M.key, 0.3);
  });
  return { GY, CX, M };
}
