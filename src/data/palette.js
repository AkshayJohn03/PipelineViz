/**
 * palette.js — one distinct, calm hue per system, used everywhere it appears:
 * 3D icon, in-scene title label, bottom stepper, flow boxes, panel accents.
 * The background stays near-black slate; hues are pastel-bright but not neon,
 * so each stage reads as its own identity without vibrating.
 */
export const STAGES = {
  ch0: { name: 'The map', color: '#94A3B8' },
  ch1: { name: 'Identity', color: '#7DD3FC' },
  ch2: { name: 'Gateway', color: '#FBBF24' },
  ch3: { name: 'Retrieve & answer', color: '#6EE7B7' },
  ch4: { name: 'ForensiQ', color: '#C4B5FD' },
  ch5: { name: 'VerdictAI', color: '#F9A8D4' },
  ch6: { name: 'RedForge', color: '#F87171' },
  ch7: { name: 'Platform services', color: '#67E8F9' },
  ch8: { name: 'Certified answer', color: '#E2E8F0' },
};

/** 3D object key → chapter id (objects.js builders are keyed the same way). */
export const KEY_TO_CH = {
  constellation: 'ch0',
  badge: 'ch1',
  gateway: 'ch2',
  book: 'ch3',
  magnifier: 'ch4',
  scales: 'ch5',
  shield: 'ch6',
  hive: 'ch7',
  flask: 'ch7',
  recap: 'ch8',
};

export function colorFor(objectKey) {
  return STAGES[KEY_TO_CH[objectKey]]?.color || '#94A3B8';
}
export function nameFor(objectKey) {
  const chId = KEY_TO_CH[objectKey];
  if (objectKey === 'flask') return 'Model-Distillery';
  if (objectKey === 'hive') return 'SwarmResearch';
  return STAGES[chId]?.name || objectKey;
}
export function numFor(objectKey) {
  const chId = KEY_TO_CH[objectKey];
  return chId ? chId.replace('ch', '') : '00';
}
