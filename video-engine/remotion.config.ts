import {Config} from '@remotion/cli/config';

// Use the Chromium that is preinstalled in this workspace (no download needed).
Config.setBrowserExecutable(
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
);
// WebGL without a GPU: software-rendered ANGLE so Three.js works when rendering.
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
