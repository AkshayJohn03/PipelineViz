/**
 * icons.js — hand-drawn 24×24 stroke SVG icons, one per system, rendered to
 * canvas textures (crisp at any size). Recognizable representations instead
 * of generic primitive shapes.
 */
const S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

export const ICONS = {
  constellation: `<g ${S}><circle cx="5" cy="6" r="1.4"/><circle cx="18" cy="4.5" r="1.4"/><circle cx="12" cy="12" r="1.7"/><circle cx="5" cy="18" r="1.4"/><circle cx="19" cy="17" r="1.4"/><path d="M6.2 7 10.8 11M13.4 11l3.8-5.2M13.6 13.2l4.2 3M6.3 17l4.2-3.6M17.7 16.2 6.2 7.2"/></g>`,
  badge: `<g ${S}><rect x="3" y="4.5" width="18" height="15" rx="2"/><circle cx="9" cy="10.5" r="2"/><path d="M5.8 16.5c.6-1.8 1.8-2.7 3.2-2.7s2.6.9 3.2 2.7M15 9h4M15 12.5h4M15 16h2.5"/></g>`,
  gateway: `<g ${S}><rect x="9.5" y="9.5" width="5" height="5" rx="1" transform="rotate(45 12 12)"/><path d="M3 5h4l3 4.5M3 12h5.2M3 19h4l3-4.5M21 5h-4l-3 4.5M21 12h-5.2M21 19h-4l-3-4.5"/></g>`,
  book: `<g ${S}><path d="M12 6.5C10.5 5 8.5 4.5 6 4.5c-1 0-2 .1-3 .4v13.6c1-.3 2-.4 3-.4 2.5 0 4.5.5 6 1.9 1.5-1.4 3.5-1.9 6-1.9 1 0 2 .1 3 .4V4.9c-1-.3-2-.4-3-.4-2.5 0-4.5.5-6 2z"/><path d="M12 6.5v13.5"/></g>`,
  magnifier: `<g ${S}><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l6 6"/><path d="M8 10.5c0-1.4 1.1-2.5 2.5-2.5"/></g>`,
  scales: `<g ${S}><path d="M12 4v16M8 20h8M4 7h16M12 4l-8 3 2.7 5.5a3.2 3.2 0 0 0 5.3 0L12 4zM12 4l8 3-2.7 5.5a3.2 3.2 0 0 1-5.3 0L12 4z"/></g>`,
  shield: `<g ${S}><path d="M12 3l7.5 3v5.5c0 4.6-3 8-7.5 9.5-4.5-1.5-7.5-4.9-7.5-9.5V6L12 3z"/><path d="M9 11.5l2.2 2.2L15.5 9.5"/></g>`,
  hive: `<g ${S}><circle cx="12" cy="5" r="2.2"/><circle cx="5.5" cy="16.5" r="2.2"/><circle cx="18.5" cy="16.5" r="2.2"/><circle cx="12" cy="13.5" r="1.2"/><path d="M11 7l-4.6 7.5M13 7l4.6 7.5M7.7 16.5h3.1M13.2 14.4l3.6 1.2"/></g>`,
  flask: `<g ${S}><path d="M10 3.5h4M11 3.5v5L5.8 17a2.4 2.4 0 0 0 2.1 3.5h8.2a2.4 2.4 0 0 0 2.1-3.5L13 8.5v-5"/><path d="M7.5 14.5h9"/><circle cx="11" cy="17" r="0.9"/><circle cx="13.6" cy="16" r="0.6"/></g>`,
  recap: `<g ${S}><circle cx="6" cy="18" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="18" cy="14" r="1.6"/><path d="M6.8 16.6 11.2 7.4M13.2 7.2l3.8 5.4M8 17.4l8.4-2.8"/><path d="M4 21h16" stroke-dasharray="1.5 2.5"/></g>`,
};

/** Render an icon to a crisp canvas texture tinted with `color`. */
export function iconTexture(iconKey, color, px = 256) {
  const svg = ICONS[iconKey] || ICONS.recap;
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${px}" height="${px}">${svg.replace('currentColor', color)}</svg>`;
  const url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = px;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, px, px);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      resolve(tex);
    };
    img.src = url;
  });
}

// three import is only needed for the texture type — kept here intentionally
import * as THREE from 'three';
