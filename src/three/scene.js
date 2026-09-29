/**
 * scene.js — VERTICAL journey: the request packet travels top → bottom through
 * the screen centre as you scroll, passing each icon stop; explainer panels
 * alternate on the left/right sides. The camera stays essentially fixed (tiny
 * drift), so the packet's travel is always visible.
 *
 * prefers-reduced-motion calms DECORATION (idle spin, trail, smoothing) but
 * never freezes the journey — the packet still follows the scroll.
 */
import * as THREE from 'three';
import { BUILDERS } from './objects.js';
import { colorFor } from '../data/palette.js';

const ORDER = [
  'constellation', 'badge', 'gateway', 'book', 'magnifier',
  'scales', 'shield', 'hive', 'flask', 'recap',
];

export function initScene(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0f1a, 12, 26);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 0.3, 11.5);
  camera.lookAt(0, 0, -1.6);

  scene.add(new THREE.AmbientLight(0x38445e, 1.4));
  const key = new THREE.DirectionalLight(0xf2f6fc, 1.2);
  key.position.set(4, 8, 8);
  scene.add(key);

  // ---- stops: vertical line through the screen centre --------------------
  const stages = new Map();
  const TOP = 4.7, BOTTOM = -4.7, X = 1.15, Z = -1.6;
  ORDER.forEach((key, i) => {
    const built = BUILDERS[key]();
    const f = i / (ORDER.length - 1);
    const anchor = new THREE.Vector3(
      (i % 2 === 0 ? -1 : 1) * X * (i === 0 || i === ORDER.length - 1 ? 0.4 : 1),
      TOP - f * (TOP - BOTTOM),
      Z,
    );
    built.group.position.copy(anchor);
    scene.add(built.group);
    stages.set(key, { ...built, anchor });
  });

  // ---- connecting path + packet + trail ----------------------------------
  const anchors = ORDER.map((k) => stages.get(k).anchor);
  const curve = new THREE.CatmullRomCurve3(anchors, false, 'catmullrom', 0.08);
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(200)),
    new THREE.LineBasicMaterial({ color: 0x3d4a63, transparent: true, opacity: 0.55 }),
  ));

  const packet = new THREE.Group();
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x7dd3fc, emissiveIntensity: 2.6 }),
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.15 }),
  );
  const packetLight = new THREE.PointLight(0x7dd3fc, 20, 7);
  packet.add(orb, halo, packetLight);
  packet.position.copy(anchors[0]);
  scene.add(packet);

  const TRAIL = 7;
  const trail = [];
  for (let i = 0; i < TRAIL; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.09 * (1 - i / TRAIL), 12, 10),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.35 * (1 - i / TRAIL) }),
    );
    trail.push(m);
    scene.add(m);
  }
  const trailPts = [];

  // ---- state --------------------------------------------------------------
  let activeKey = ORDER[0];
  const pointer = { x: 0, y: 0 };
  let progress = 0;
  const calm = reducedMotion; // damps decoration only — never freezes the journey

  function nearestStage(p) {
    const point = curve.getPoint(p);
    let best = ORDER[0], bestD = Infinity;
    ORDER.forEach((k) => {
      const d = stages.get(k).anchor.distanceToSquared(point);
      if (d < bestD) { bestD = d; best = k; }
    });
    return best;
  }

  function focusChapter(objectKey) {
    if (!stages.has(objectKey)) return;
    activeKey = objectKey;
    stages.forEach((st, k) => st.setActive(k === objectKey));
    const c = new THREE.Color(colorFor(objectKey));
    orb.material.emissive = c;
    halo.material.color = c;
    packetLight.color = c;
    trail.forEach((m) => { m.material.color = c; });
  }

  function setProgress(p) {
    progress = Math.min(1, Math.max(0, p));
    packet.position.copy(curve.getPoint(progress));
  }

  function pulseStage(objectKey) {
    const st = stages.get(objectKey);
    if (!st) return;
    st.setActive(true);
    setTimeout(() => st.setActive(objectKey === activeKey), 420);
  }

  const raycaster = new THREE.Raycaster();
  const clickNdc = new THREE.Vector2();
  let onStageClick = null;

  function pick(event) {
    clickNdc.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickNdc.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickNdc, camera);
    for (const [key, st] of stages) {
      if (raycaster.intersectObject(st.group, true).length && onStageClick) onStageClick(key);
    }
  }
  canvas.addEventListener('click', pick);

  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---- render loop --------------------------------------------------------
  const clock = new THREE.Clock();
  function frame() {
    const rawDt = clock.getDelta();
    const dt = calm ? rawDt * 0.3 : rawDt;
    const t = clock.elapsedTime;
    stages.forEach((st) => st.animate(t, dt));

    // the packet ALWAYS follows progress — this is the lesson, not decoration
    packet.position.copy(curve.getPoint(progress));
    if (!calm) {
      halo.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
      trailPts.unshift(packet.position.clone());
      if (trailPts.length > TRAIL * 3) trailPts.pop();
      trail.forEach((m, i) => {
        const pt = trailPts[Math.min(trailPts.length - 1, (i + 1) * 3)];
        if (pt) m.position.copy(pt);
      });
    }

    const near = nearestStage(progress);
    if (near !== activeKey) focusChapter(near);

    // essentially fixed camera with a whisper of drift + pointer parallax
    const targetCamY = Math.sin(t * 0.1) * 0.15;
    camera.position.y += (targetCamY - camera.position.y) * Math.min(1, rawDt);
    camera.position.x = pointer.x * 0.45;
    camera.lookAt(0, 0, Z);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  stages.forEach((st, k) => st.setActive(k === activeKey));

  return {
    focusChapter,
    setProgress,
    pulseStage,
    getPacketY: () => packet.position.y,
    getProgress: () => progress,
    set onStageClick(cb) { onStageClick = cb; },
    dispose() { renderer.dispose(); },
  };
}
