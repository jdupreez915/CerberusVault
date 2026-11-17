// shots/lib.js — data-driven shot library for the Cerberus general series.
// Every shot in story/shots.json carries params.type; this file registers a renderer for each shot id.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, wordTime, seg, circle, ring, rr, poly, glow, alpha, text, measure, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { office, desk } from '../sets/office.js';
import { warehouse } from '../sets/warehouse.js';
import { CAST } from '../cast.js';

const SETS = { office, warehouse };
const col = (c) => ({ gold: S().ui.gold, red: S().ui.accent, cream: S().ui.cream, green: '#5ee38f' }[c] || c || S().ui.cream);
const norm = (w) => w.toLowerCase().replace(/[^\w']/g, '');
function wt(key, after) { if (key[0] !== '=') return wordTime(key, after); const m = norm(key.slice(1)); const w = E.words.find(w => w.start >= after - 0.05 && norm(w.word) === m); return w ? w.start : null; }
const land = (info, key, fb) => (key ? (wt(key, info.shot.start) ?? info.shot.start + fb) : info.shot.start + fb) - info.shot.start;
const pose = (p) => (typeof p === 'string' ? POSES[p] : p) || POSES.stand;
function exampleTag(g, a = 1) { text(g, 'EXAMPLE FIGURES', V(80, 70), V(80, 150), { size: V(26, 30), color: alpha(S().ui.cream, 0.75), font: FONTS.ui, weight: 900, align: 'left', spacing: 3, alpha: a }); }
function setBg(g, t, p, cam) { return (SETS[p.set || 'office'] || office)(g, t, cam); }
function blurredSet(g, t, p, k = 14, dark = 0.4) { blurLayer(g, k, (g) => setBg(g, t, p, { z: 1.6, x: p.bgx ?? -80, y: -220 })); veil(g, '#0a0812', dark); }
function topLine(g, t, info, str, y = 0.16, size) { if (str) UI.bigLine(g, t, { str, dur: info.dur, y: E.H * y, size: size || V(80, 92), color: S().ui.cream }); }

// ---------- figures in a set (establishing / medium) ----------
function drawSet(g, t, info, p) {
  const d = info.dur, c = p.cam || {}, cam = { z: lerp(c.z0 ?? 1, c.z1 ?? 1.06, ease.inOut(t / d)), x: (c.x ?? 0) + (c.dx ?? 30) * ease.inOut(t / d), y: c.y ?? 0 };
  const { GY, M } = setBg(g, t, p, cam);
  layer(g, cam, 1, (g) => {
    if (p.desk) { const dx = E.W / 2 + V(120, 150); g.save(); g.translate(dx - V(250, 230), 0); FX.chair(g, 0, GY, V(1.2, 1.45), '#1d1722'); g.restore(); desk(g, dx, GY, t); }
    (p.who || []).forEach((w, i) => {
      const at = w.at ? land(info, w.at, 0.6) : 0;
      const ps = w.pose2 && t > at ? pose(w.pose2) : pose(w.pose);
      const walk = w.walk ? { x: w.walk * t } : { x: 0 };
      drawFigure(g, { x: E.W * (w.x ?? 0.5) + walk.x, y: GY, s: w.s ?? V(1.3, 1.5), facing: w.facing ?? 1, outfit: CAST[w.c || 'SAM'],
        pose: w.freeze ? ps : breathe(ps, t, 1, i + 1), expr: w.expr2 && t > at ? w.expr2 : (w.expr || 'neutral'), prop: w.prop ? { type: w.prop } : undefined,
        rim: { color: M.rim, dir: w.rim || [0, -1], w: 5 }, blink: (t % (3 + i * 0.3)) > 2.9 + i * 0.3, shadow: !p.desk });
    });
  });
  if (p.bubbles) for (let i = 0; i < 6; i++) { const st = 0.2 + i * 0.4, q = prog(t, st, st + 1.5); if (q <= 0 || q >= 1) continue;
    const x = E.W / 2 + (i % 2 ? 110 : -70), y = E.H * 0.52 - q * V(380, 520), a = clamp(Math.min(q * 5, (1 - q) * 4));
    g.save(); g.globalAlpha *= a; rr(g, x - 120, y - 32, 240, 64, 32); g.fillStyle = '#efe8e2'; g.fill(); text(g, p.bubbles, x, y + 2, { size: 30, color: '#0a0909', font: FONTS.ui, weight: 900 }); g.restore(); }
  if (p.readout) { const r = p.readout, tl = land(info, r.key, 0.6), v = lerp(r.from ?? 0, r.to, ease.out(prog(t, tl - 0.3, tl + 0.8)));
    UI.readout(g, { label: (r.label || '') + '   ', value: (r.prefix || '') + (r.dec ? v.toFixed(r.dec) : Math.round(v).toLocaleString('en-US')) + (r.suffix || ''), x: E.W / 2, y: E.H * 0.13, align: 'center', size: V(90, 110), color: col(r.color || 'gold'), a: ease.out(prog(t, 0.1, 0.4)) }); }
  if (p.ex) exampleTag(g);
  if (p.fx === 'rain') FX.rain(g, t, { a: 0.25 }); else FX.dust(g, t, { count: 30, a: 0.3 });
  topLine(g, t, info, p.title, p.titleY ?? 0.17);
}

// ---------- giant face ----------
function drawFace(g, t, info, p) {
  blurredSet(g, t, p);
  if (p.fx === 'rain') FX.rain(g, t, { a: 0.25 });
  const at = land(info, p.at, 0.6), r = V(300, 340) * (1 + 0.04 * t), M = mood('night');
  bigFace(g, E.W / 2, E.H * 0.52, r, { outfit: CAST[p.c || 'SAM'], expr: p.expr2 && t > at ? p.expr2 : (p.expr || 'neutral'), look: p.look || [0.2, -0.1], rimColor: M.rim, rimSide: p.side ?? 1, tilt: 0.04 * Math.sin(t * 2.5) });
  if (p.fx === 'sparkle') for (let i = 0; i < 7; i++) { const a = i * 0.9 + t * 0.6, rr2 = r * 1.35 + 30 * Math.sin(t * 2 + i); FX.sparkle(g, E.W / 2 + Math.cos(a) * rr2, E.H * 0.5 + Math.sin(a) * rr2, 18 + 8 * Math.sin(t * 6 + i), S().ui.gold, 0.8); }
  if (p.fx === 'shock') { FX.rings(g, E.W / 2, E.H * 0.5, t, { count: 3, r0: r, r1: r * 2, color: S().ui.accent, a: 0.35, speed: 1.2 }); }
  if (p.badge) UI.badge(g, { str: p.badge, x: E.W / 2 + V(300, 400), y: E.H * 0.18, size: V(40, 48), color: col(p.badgeColor || 'gold'), a: ease.out(prog(t, at, at + 0.3)) });
  topLine(g, t, info, p.title, 0.15);
}

// ---------- blueprint breakdown (rows land one by one) ----------
function boxIcon(g, x, y, s, c) { g.strokeStyle = c; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - s, y - s * 0.4); g.lineTo(x, y - s * 0.9); g.lineTo(x + s, y - s * 0.4); g.lineTo(x + s, y + s * 0.6); g.lineTo(x, y + s * 1.1); g.lineTo(x - s, y + s * 0.6); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(x - s, y - s * 0.4); g.lineTo(x, y + s * 0.1); g.lineTo(x + s, y - s * 0.4); g.moveTo(x, y + s * 0.1); g.lineTo(x, y + s * 1.1); g.stroke(); }
function drawBreakdown(g, t, info, p) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui;
  const sh = p.big ? 14 * (1 - prog(t, 0, 0.5)) : 0, [sx, sy] = sh ? shake(t, sh, 28) : [0, 0];
  g.save(); g.translate(sx, sy); const z = 1 + 0.04 * t; g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const rows = p.rows || [], n = rows.length, x0 = V(300, 110), x1 = E.W - V(300, 110), y0 = E.H * 0.27, dy = V(100, Math.min(140, 620 / Math.max(1, n)));
  boxIcon(g, E.W / 2, y0 - V(160, 210), V(46, 58), alpha(c, 0.9));
  text(g, p.title || 'ONE ORDER', E.W / 2, y0 - V(55, 65), { size: V(34, 40), color: alpha(c, 0.9), font: FONTS.ui, weight: 900, spacing: 4 });
  const from = p.from ?? 0, keys = p.keys || [];
  rows.forEach((r, i) => {
    let q = 1; if (i >= from) { const tl = land(info, keys[i - from], 0.35 + (i - from) * 0.55); q = ease.outBack(prog(t, tl - 0.15, tl + 0.3)); } if (q <= 0) return;
    const y = y0 + V(40, 60) + i * dy, cc = col(r[2]);
    g.save(); g.globalAlpha *= clamp(q); g.translate(0, (1 - clamp(q)) * 30);
    text(g, r[0], x0, y, { size: V(32, 38), color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
    text(g, r[1], x1, y, { size: V(54, 64), color: cc, font: FONTS.ui, weight: 900, align: 'right', glow: 16, glowColor: alpha(cc, 0.5) });
    g.setLineDash([6, 10]); seg(g, [[x0, y + V(38, 46)], [x1, y + V(38, 46)]], 2, alpha(c, 0.3)); g.setLineDash([]); g.restore();
  });
  const yT = y0 + V(40, 60) + n * dy + V(20, 30);
  if (p.total || p.big) seg(g, [[x0, yT - V(40, 50)], [x1, yT - V(40, 50)]], 4, alpha(c, 0.8));
  if (p.total && !p.big) { text(g, p.total[0], x0, yT + 10, { size: V(34, 40), color: alpha(ui.cream, 0.7), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 }); text(g, p.total[1], x1, yT + 10, { size: V(56, 66), color: col(p.total[2]), font: FONTS.ui, weight: 900, align: 'right' }); }
  if (p.big) { const tl = land(info, p.bigKey, 0.05), q = ease.outBack(prog(t, tl, tl + 0.35)), cc = col(p.big[2] || 'red');
    g.save(); g.translate(E.W / 2, yT + V(60, 90)); g.scale(0.4 + 0.6 * q, 0.4 + 0.6 * q);
    text(g, p.big[0], 0, 0, { size: V(190, 220), color: cc, font: FONTS.ui, weight: 900, glow: 40, glowColor: alpha(cc, 0.7), alpha: clamp(q) });
    if (p.big[1]) text(g, p.big[1], 0, V(130, 150), { size: V(46, 54), color: ui.cream, font: FONTS.ui, weight: 900, spacing: 6, alpha: clamp(q) }); g.restore(); }
  g.restore(); if (p.ex !== false) exampleTag(g);
}

// ---------- two options side by side ----------
function drawCompare(g, t, info, p) {
  blurredSet(g, t, p, 12, 0.55);
  const show = p.show || 'both', ui = S().ui, w = V(420, 460), h = V(520, 560), y = E.H * 0.22;
  const panel = (side, o, k, hl) => {
    const single = (p.show || 'both') !== 'both', x = single ? (E.W - w) / 2 : side < 0 ? E.W / 2 - w - 24 : E.W / 2 + 24, q = ease.outBack(prog(t, k, k + 0.35)); if (q <= 0) return;
    g.save(); g.globalAlpha *= clamp(q) * (hl === false ? 0.45 : 1); g.translate(x + w / 2, y + h / 2); g.scale(0.85 + 0.15 * q, 0.85 + 0.15 * q); g.translate(-(x + w / 2), -(y + h / 2));
    rr(g, x, y, w, h, 28); g.fillStyle = ui.card; g.fill(); g.strokeStyle = col(o.color); g.lineWidth = hl ? 6 : 3; g.stroke(); if (hl) glow(g, x + w / 2, y + h / 2, w, col(o.color), 0.15);
    text(g, o.tag || (side < 0 ? 'OPTION A' : 'OPTION B'), x + w / 2, y + 60, { size: V(26, 30), color: alpha(ui.cream, 0.6), font: FONTS.ui, weight: 900, spacing: 3 });
    text(g, o.title, x + w / 2, y + 140, { size: V(42, 48), color: col(o.color), font: FONTS.ui, weight: 900 });
    (o.lines || []).forEach((l, i) => text(g, l, x + w / 2, y + 250 + i * 80, { size: V(40, 46), color: ui.cream, font: FONTS.ui, weight: 800 }));
    g.restore(); };
  const kL = land(info, p.keyL, 0.2), kR = land(info, p.keyR, show === 'both' ? 0.2 : 0.6);
  if (show !== 'right') panel(-1, p.left, show === 'both' && !p.keyL ? 0.1 : kL, p.hl === 'left' ? true : p.hl === 'right' ? false : undefined);
  if (show !== 'left') panel(1, p.right, kR, p.hl === 'right' ? true : p.hl === 'left' ? false : undefined);
  if (p.ex) exampleTag(g);
  topLine(g, t, info, p.title, 0.12, V(72, 80));
}

// ---------- big statement ----------
function drawStatement(g, t, info, p) {
  blurredSet(g, t, p, 10, 0.55);
  UI.titleCard(g, t, { lines: p.lines, dur: info.dur + 1, y: E.H * (p.y ?? 0.4) });
  if (p.sub) text(g, p.sub, E.W / 2, E.H * ((p.y ?? 0.4) + 0.11), { size: V(54, 60), font: FONTS.serif, weight: 900, italic: true, color: S().ui.cream, alpha: ease.out(prog(t, land(info, p.subKey, 0.8), land(info, p.subKey, 0.8) + 0.4)) });
  FX.dust(g, t, { count: 24, a: 0.3 });
}

// ---------- freeze frame ----------
function drawFreeze(g, t, info, p) {
  const cam = { z: 1.12 + 0.03 * t, x: 30, r: 0.01 * t };
  const { GY, M } = setBg(g, 0.4, p, cam);
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W * (p.x ?? 0.5), y: GY, s: V(1.4, 1.6), facing: p.facing ?? 1, outfit: CAST[p.c || 'SAM'], pose: pose(p.pose || 'cheer'), expr: p.expr || 'joy', rim: { color: M.rim, dir: [0, -1], w: 5 } }));
  veil(g, '#1a3a5a', 0.38); FX.drops(g, 0.4, { count: 60, a: 0.6 });
  FX.rings(g, E.W / 2, E.H * 0.5, t, { count: 2, r0: 120, r1: 700, color: '#cfe8ff', a: 0.25, speed: 0.6 });
  topLine(g, t, info, p.title, 0.16, V(80, 96));
  if (p.badge) UI.badge(g, { str: p.badge, x: E.W / 2 + V(300, 400), y: E.H * 0.24, size: V(40, 46), a: ease.out(prog(t, 0.8, 1.2)) });
}

// ---------- line chart card (one or two series) ----------
function drawChart(g, t, info, p) {
  blurredSet(g, t, p, 12, 0.5); const ui = S().ui;
  const cw = 900, ch = 760, cx = (E.W - cw) / 2, cy = E.H * 0.2, q0 = ease.out(prog(t, 0, 0.35));
  g.save(); g.globalAlpha *= q0; rr(g, cx, cy, cw, ch, 28); g.fillStyle = ui.card; g.fill(); g.strokeStyle = ui.cardLine; g.lineWidth = 2.5; g.stroke();
  text(g, p.title || '', cx + 60, cy + 80, { size: 44, color: ui.text, font: FONTS.ui, weight: 900, align: 'left' });
  const x0 = cx + 80, x1 = cx + cw - 80, yA = cy + 170, yB = cy + ch - 90;
  for (let i = 0; i < 4; i++) { g.fillStyle = alpha(ui.text, 0.08); g.fillRect(x0, yA + i * (yB - yA) / 3, x1 - x0, 2); }
  (p.series || []).forEach((s, k) => {
    const st = land(info, s.key, 0.3 + k * 0.8), pp = ease.inOut(prog(t, st, st + (s.dur || 1.6))); if (pp <= 0) return; const cc = col(s.color);
    const f = (u) => s.dir === 'up' ? 0.85 - 0.7 * Math.pow(u, 1.6) : 0.15 + 0.7 * Math.pow(u, 1.4);
    g.strokeStyle = cc; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i <= 80; i++) { const u = (i / 80) * pp, x = lerp(x0, x1, u), y = lerp(yA, yB, f(u)) + Math.sin(u * 20 + k) * 8; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    const ux = lerp(x0, x1, pp), uy = lerp(yA, yB, f(pp)); glow(g, ux, uy, 60, cc, 0.8);
    text(g, s.label, ux - 10, uy - 40, { size: 36, color: cc, font: FONTS.ui, weight: 900, align: 'right', alpha: clamp(pp * 3) });
  });
  if (p.xlabel) text(g, p.xlabel, x1, yB + 50, { size: 28, color: ui.sub, font: FONTS.ui, weight: 900, align: 'right', spacing: 2 });
  g.restore(); topLine(g, t, info, p.top, 0.12, V(70, 80));
}

// ---------- draining gauge (cash) ----------
function drawGauge(g, t, info, p) {
  blurredSet(g, t, p, 12, 0.5); const ui = S().ui;
  const x0 = 120, x1 = E.W - 120, y = E.H * 0.42, h = 90;
  const hits = (p.hits || []).map((hh, i) => ({ ...hh, at: land(info, hh.key, 0.4 + i * 0.7) }));
  let lvl = p.from ?? 1; hits.forEach((hh) => { lvl -= hh.drop * ease.out(prog(t, hh.at, hh.at + 0.35)); }); lvl = clamp(lvl);
  text(g, p.label || 'CASH IN THE BANK', x0, y - 90, { size: 44, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  rr(g, x0, y - h / 2, x1 - x0, h, h / 2); g.fillStyle = alpha(ui.cream, 0.08); g.fill();
  const cc = lvl < 0.25 ? ui.accent : ui.gold; rr(g, x0, y - h / 2, Math.max(h, (x1 - x0) * lvl), h, h / 2); g.fillStyle = cc; g.fill(); glow(g, x0 + (x1 - x0) * lvl, y, 90, cc, 0.6);
  hits.forEach((hh, i) => { const q = ease.outBack(prog(t, hh.at, hh.at + 0.3)); if (q <= 0) return; const yy = y + 160 + i * 110;
    g.save(); g.globalAlpha *= clamp(q); text(g, hh.str, E.W / 2, yy, { size: V(46, 54), color: ui.accent, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(ui.accent, 0.5) }); g.restore(); });
  if (lvl < 0.15) { const [sx, sy] = shake(t, 4, 30); text(g, 'LOW', x1 + sx - 20, y - 90 + sy, { size: 40, color: ui.accent, font: FONTS.ui, weight: 900, align: 'right' }); }
  topLine(g, t, info, p.top, 0.13, V(70, 80));
}

// ---------- comment bubble (debate line) ----------
function drawBubble(g, t, info, p) {
  blurredSet(g, t, p, 12, 0.55);
  const q = ease.outBack(prog(t, 0.05, 0.4)), w = 900, h = p.h || 380, x = (E.W - w) / 2, y = E.H * 0.3;
  g.save(); g.translate(x + 100, y + h); g.scale(0.6 + 0.4 * q, 0.6 + 0.4 * q); g.rotate(-0.02); g.translate(-(x + 100), -(y + h)); g.globalAlpha *= clamp(q * 2);
  rr(g, x, y, w, h, 40); g.fillStyle = '#efe8e2'; g.fill(); poly(g, [[x + 80, y + h - 4], [x + 60, y + h + 50], [x + 150, y + h - 4]], '#efe8e2');
  circle(g, x + 70, y + 70, 30, '#0a0909'); text(g, p.label || 'hot take', x + 120, y + 72, { size: 32, color: '#5c5552', font: FONTS.ui, weight: 800, align: 'left' });
  (p.lines || []).forEach((l, i) => text(g, l, x + 50, y + 160 + i * 84, { size: 64, color: i === (p.redLine ?? -1) ? '#e5383b' : '#0a0909', font: FONTS.ui, weight: 900, align: 'left' }));
  g.restore();
}

// ---------- closing card (no product pitch) ----------
function drawEnd(g, t, info, p) {
  blurredSet(g, t, p, 10, 0.6);
  UI.titleCard(g, t, { lines: p.lines, dur: info.dur + 1, y: E.H * 0.34 });
  if (p.sub) text(g, p.sub, E.W / 2, E.H * 0.45, { size: V(52, 58), font: FONTS.serif, weight: 900, italic: true, color: S().ui.cream, alpha: ease.out(prog(t, 0.7, 1.2)) });
  const sp = ease.outBack(prog(t, 1.2, 1.7)), pulse = t > 1.7 ? 1 + 0.04 * Math.sin((t - 1.7) * 6) : 1, label = p.pill || 'Follow @cerberusvault.ai';
  g.save(); g.translate(E.W / 2, E.H * 0.56); g.scale(sp * pulse, sp * pulse); const pw = measure(g, label, 40, FONTS.ui, 900) + 110;
  rr(g, -pw / 2, -48, pw, 96, 48); g.fillStyle = '#e5383b'; g.fill(); glow(g, 0, 0, pw * 0.6, '#e5383b', 0.25); text(g, label, 0, 2, { size: 40, color: '#efe8e2', font: FONTS.ui, weight: 900 }); g.restore();
}

const DRAW = { set: drawSet, face: drawFace, breakdown: drawBreakdown, compare: drawCompare, statement: drawStatement, freeze: drawFreeze, chart: drawChart, gauge: drawGauge, bubble: drawBubble, end: drawEnd };

// ---------- 3D: stacks (left grows, right shrinks) ----------
const THREE_SHOT = (p) => ({
  kind: '3d',
  init(T) {
    const M = mood('night'); const st = T.stage({ mood: 'night', fov: 50, fog: [10, 40], keyPos: [-6, 8, 6], keyIntensity: 2.4, ambient: 1.1 });
    st.add(T.ground(60, 60, M.floor, T.tiles(M.floor, 10, [10, 10]))); st.add(T.box(30, 8, 0.4, M.wall, 0, 4, -5));
    for (const x of [-5, 5]) { const w = T.windowPane(3, 3.4, { glowColor: M.practical, cols: 3, rows: 2, power: 0.35, interior: true }); w.position.set(x, 2.6, -4.78); st.add(w); }
    const L = [], R = [];
    for (let i = 0; i < 18; i++) { const c = i % 3, r = Math.floor(i / 3); const b = T.box(0.6, 0.5, 0.6, i % 2 ? (p.leftColor || '#8a6a4a') : '#6e5238', -2.2 + c * 0.65, 0.25 + r * 0.52, -0.6); b.visible = false; st.add(b); L.push(b); }
    for (let i = 0; i < 16; i++) { const c = T.cyl(0.35, 0.35, 0.09, p.rightColor || '#e8b84a', 2.0, 0.05 + i * 0.1, 0, 28); st.add(c); R.push(c); }
    const who = T.figure3D(CAST[p.c || 'SAM'], { rim: M.rim, pose: POSES[p.pose || 'handsOnHead'] }); who.position.set(0, 0, 0.8); who.rotation.y = -Math.PI / 2; st.add(who);
    return { stage: st, L, R };
  },
  draw(s, t, info, T) { const q = clamp(t / (info.dur - 0.4)); s.L.forEach((b, i) => { b.visible = i < Math.round(q * 18); }); s.R.forEach((c, i) => { c.visible = i < Math.round(16 * (1 - q * 0.9)); });
    T.orbit(s.stage.camera, t, { target: [0, 1.1, 0], radius: 11, height: [3.2, 2.6], from: -0.35, to: 0.35, dur: info.dur }); },
  overlay(g, t) { text(g, p.left || 'MORE ORDERS', 280, E.H * 0.14, { size: 50, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 2, alpha: ease.out(prog(t, 0.2, 0.6)) });
    text(g, p.right || 'LESS CASH', E.W - 280, E.H * 0.14, { size: 50, color: S().ui.accent, font: FONTS.ui, weight: 900, spacing: 2, alpha: ease.out(prog(t, 0.8, 1.2)) }); },
});

for (const sh of E.shots) {
  const p = sh.params || {};
  if (p.type === 'three') registerShot(sh.id, THREE_SHOT(p));
  else if (DRAW[p.type]) registerShot(sh.id, { draw(g, t, info) { DRAW[p.type](g, t, info, p); } });
}
