// Small deterministic helpers. Everything is a function of the frame number.
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const backOut = (x: number) => { x = clamp(x); const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
/** progress 0..1 of a beat that starts at `startS` seconds and lasts `durS` */
export const beat = (frame: number, fps: number, startS: number, durS: number) => clamp((frame / fps - startS) / durS);
