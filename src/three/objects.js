/**
 * objects.js — each chapter's 3D stop: a crisp SVG-icon sprite (recognizable
 * representation, not a generic primitive), a soft backing disc, and a title
 * label rendered above it so every stop names itself in the scene.
 */
import * as THREE from 'three';
import { ICONS, iconTexture } from './icons.js';
import { colorFor, nameFor, numFor } from '../data/palette.js';

function group(...children) {
  const g = new THREE.Group();
  children.forEach((c) => g.add(c));
  return g;
}

function makeLabelSprite(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 112;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 112);
  // pill
  ctx.fillStyle = 'rgba(10, 15, 26, 0.88)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  const w = Math.min(500, 40 + text.length * 20);
  const x = (512 - w) / 2, y = 14, h = 84, r = 20;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill(); ctx.stroke();
  // number chip + text
  ctx.fillStyle = color;
  ctx.font = '600 40px "JetBrains Mono", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, y + h / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthTest: false,
  }));
  sprite.scale.set(1.55, 1.55 * (112 / 512), 1); // compact: ≈ 1.55 x 0.34
  return sprite;
}

export function buildStage(iconKey) {
  const color = colorFor(iconKey);
  const colorObj = new THREE.Color(color);

  const g = group();
  const holder = new THREE.Group();
  g.add(holder);

  const icon = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    new THREE.MeshBasicMaterial({
      map: null, transparent: true, depthWrite: false,
      toneMapped: false,
    }),
  );
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(0.98, 48),
    new THREE.MeshBasicMaterial({
      color: colorObj, transparent: true, opacity: 0.1,
      side: THREE.DoubleSide, depthWrite: false,
    }),
  );
  halo.position.z = -0.05;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.02, 10, 64),
    new THREE.MeshBasicMaterial({ color: colorObj, transparent: true, opacity: 0.5 }),
  );
  const light = new THREE.PointLight(colorObj, 5, 3.8);
  holder.add(icon, halo, ring, light);

  const label = makeLabelSprite(`${numFor(iconKey)} · ${nameFor(iconKey)}`, color);
  const side = (iconKey.length % 2 === 0) ? 1 : -1; // keep labels off the panel side
  label.position.set(side * 1.55, 0.15, 0);
  g.add(label);

  let disposed = false;
  iconTexture(iconKey, color).then((tex) => {
    if (disposed) return;
    icon.material.map = tex;
    icon.material.needsUpdate = true;
  });

  return {
    group: g,
    color,
    animate(t) {
      holder.rotation.y = Math.sin(t * 0.3 + iconKey.length) * 0.28;
      icon.position.y = Math.sin(t * 0.7) * 0.05;
      ring.rotation.z = t * 0.08;
      label.material.opacity = 0.8 + Math.sin(t * 1.2) * 0.1;
      label.position.y = 0.15 + Math.sin(t * 0.9) * 0.03;
    },
    setActive(active) {
      icon.material.opacity = active ? 1 : 0.5;
      halo.material.opacity = active ? 0.18 : 0.07;
      ring.material.opacity = active ? 0.85 : 0.25;
      light.intensity = active ? 7 : 2.2;
      label.material.opacity = active ? 1 : 0.5;
    },
    dispose() { disposed = true; },
  };
}

export const BUILDERS = {
  constellation: () => buildStage('constellation'),
  badge: () => buildStage('badge'),
  gateway: () => buildStage('gateway'),
  book: () => buildStage('book'),
  magnifier: () => buildStage('magnifier'),
  scales: () => buildStage('scales'),
  shield: () => buildStage('shield'),
  hive: () => buildStage('hive'),
  flask: () => buildStage('flask'),
  recap: () => buildStage('recap'),
};
