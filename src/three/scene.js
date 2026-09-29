/**
 * scene.js — the fixed 3D stage: renderer, lights, per-chapter icon stops on a
 * wide arc, the travelling request packet (tinted by the stage it's visiting),
 * and pointer interaction. The workflow diagrams (workflow.js) carry the
 * teaching; this scene is the spatial map of the same journey.
 */
import * as THREE from 'three';
import { BUILDERS } from './objects.js';
import { colorFor, nameFor } from '../data/palette.js';

// chapter order defines the arc; the map sits at the centre back
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
  scene.fog = new THREE.Fog(0x0a0f1a, 11, 26);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 0.4, 10.8);

  scene.add(new THREE.AmbientLight(0x38445e, 1.4));
  const key = new THREE.DirectionalLight(0xf2f6fc, 1.2);
  key.position.set(4, 6, 6);
  scene.add(key);

  // ---- stage stops on a wide arc (spreads across the screen) -------------
  const stages = new Map();
  ORDER.forEach((key, i) => {
    const builder = BUILDERS[key];
    if (!builder) return;
    const built = builder();
    const a = (i / (ORDER.length - 1)) * Math.PI * 1.5 - Math.PI * 0.25;
    const anchor = new THREE.Vector3(
      Math.sin(a) * 5.6,
      (i % 2 === 0 ? 0.4 : -0.4) + Math.sin(i * 1.7) * 0.18,
      -Math.cos(a) * 3.6,
    );
    built.group.position.copy(anchor);
    if (key === 'constellation') built.group.position.set(0, 0.15, -5.2);
    scene.add(built.group);
    stages.set(key, { ...built, anchor });
  });

  // ---- the request packet + path -----------------------------------------
  const anchors = ORDER.map((k) => stages.get(k).anchor);
  const curve = new THREE.CatmullRomCurve3(anchors, false, 'catmullrom', 0.35);
  const pathLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(160)),
    new THREE.LineBasicMaterial({ color: 0x3d4a63, transparent: true, opacity: 0.5 }),
  );
  scene.add(pathLine);

  const packet = new THREE.Group();
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x7dd3fc, emissiveIntensity: 2.4 }),
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.14 }),
  );
  const packetLight = new THREE.PointLight(0x7dd3fc, 18, 6);
  packet.add(orb, halo, packetLight);
  packet.position.copy(anchors[0]);
  scene.add(packet);

  // ---- interaction state --------------------------------------------------
  let activeKey = ORDER[0];
  const targetLook = new THREE.Vector3().copy(anchors[0]);
  const currentLook = new THREE.Vector3().copy(anchors[0]);
  const pointer = { x: 0, y: 0 };
  let progress = 0;
  const reduced = reducedMotion;

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
    targetLook.copy(stages.get(objectKey).anchor);
    // the packet wears the color of the stage it is visiting
    const c = new THREE.Color(colorFor(objectKey));
    orb.material.emissive = c;
    halo.material.color = c;
    packetLight.color = c;
  }

  function setProgress(p) {
    progress = Math.min(1, Math.max(0, p));
    if (reduced) packet.position.copy(curve.getPoint(progress));
  }

  function pulseStage(objectKey) {
    const st = stages.get(objectKey);
    if (!st) return;
    st.setActive(true);
    setTimeout(() => st.setActive(objectKey === activeKey), 420);
  }

  // raycast picks
  const raycaster = new THREE.Raycaster();
  const clickNdc = new THREE.Vector2();
  let onStageClick = null;

  function pick(event) {
    clickNdc.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickNdc.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickNdc, camera);
    for (const [key, st] of stages) {
      const hits = raycaster.intersectObject(st.group, true);
      if (hits.length && onStageClick) onStageClick(key);
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
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    stages.forEach((st) => st.animate(t, dt));
    if (!reduced) {
      packet.position.copy(curve.getPoint(progress));
      halo.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
      // the packet glows brighter as it approaches a stop
      const near = nearestStage(progress);
      packetLight.intensity = 14 + Math.sin(t * 2.4) * 4;
      if (near !== activeKey) focusChapter(near); // auto-follow during replay/scroll
    }
    currentLook.lerp(targetLook, Math.min(1, dt * 3));
    camera.lookAt(currentLook);
    camera.position.x += (pointer.x * 0.5 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (0.4 - pointer.y * 0.3 - camera.position.y) * Math.min(1, dt * 2);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  // initial state
  stages.forEach((st, k) => st.setActive(k === activeKey));

  return {
    focusChapter,
    setProgress,
    pulseStage,
    set onStageClick(cb) { onStageClick = cb; },
    dispose() { renderer.dispose(); },
  };
}
