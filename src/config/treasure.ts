export const KEY_CONFIG = {
  home: [-1.22, -0.06, -0.10] as [number, number, number],
  scale: 0.72,
  hoverScale: 1.12,
  floatAmplitude: 0.012,
  floatFrequency: 1.65,
  rotationSpeed: 0.55,
  dragDamping: 18,
  dragBounds: { x: [-1.45, 0.45] as [number, number], y: [-0.35, 0.72] as [number, number] },
  tip: [0.31, 0, 0] as [number, number, number],
  idleGlow: 0.06,
  hoverGlow: 0.22,
  brassColor: '#C49454',
  highlightColor: '#F5D378',
  darkBrassColor: '#6B4222',
} as const;

export const CHEST_CONFIG = {
  position: [0, 0.38, -0.42] as [number, number, number],
  dimensions: [0.6, 0.25, 0.36] as [number, number, number],
  lock: [0, 0.17, 0.195] as [number, number, number],
  lidOpenRadians: -1.83,
  woodColor: '#B06434',
  brassColor: '#D89844',
  highlightColor: '#FCE089',
  glowColor: '#FFC868',
  glowIntensity: 0.18,
  hoverGlowIntensity: 0.52,
  nearGlowIntensity: 0.68,
  fillLightColor: '#FFE0A3',
  fillLightIntensity: 1.25,
  woodRoughness: 0.48,
} as const;

export const FADE_DURATION_MS = 1500;
export const CLIP_SRC = '/media/clip.mp4';

export const TREASURE_CONFIG = {
  key: KEY_CONFIG,
  chest: CHEST_CONFIG,
  unlockDistance: 0.25,
  nearDistance: 0.35,
  unlockDuration: 0.95,
  lidOpenDuration: 1.15,
  fadeDuration: FADE_DURATION_MS / 1000,
  resetDuration: 0.85,
} as const;
