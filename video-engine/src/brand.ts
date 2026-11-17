// Cerberus brand tokens. Import these instead of hard-coding colours.
export const C = {
  bg: '#0a0909', red: '#e5383b', white: '#efe8e2', green: '#5ee38f',
  panel: '#171414', line: '#2a2524', muted: '#8d8480',
} as const;
export const FONT = "'Inter Display', 'Inter', sans-serif";
export const HANDLE = '@cerberusvault.ai';
export const FPS = 30;
// Safe zone for 1080x1920: key text in the top 70%, keep bottom 25% and right ~110px clear.
export const SAFE = {left: 70, right: 110, bottomClear: 480} as const;
