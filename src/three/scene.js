/**
 * scene.js — the fixed 3D stage: renderer, lights, per-chapter stage objects
 * placed on an arc, the travelling request packet, and pointer interaction.
 *
 * The engine (main.js) drives two inputs:
 *   focusChapter(id)  — camera looks at that stage; it brightens, others dim
 *   setProgress(p)    — 0..1 scroll progress moves the request packet along
 *                       the pipeline path
 * and receives one output: onStageClick(chapterId) from raycast picks.
 */
import * as THREE from 'three';
import { BUILDERS } from './objects.js';

const GOLD = 0xffb81c;
const CYAN = 0x00e5ff;

// chapter order defines the arc; constellation sits at the centre back
const ORDER = [
  'constellation', 'badge', 'gateway', 'book', 'magnifier',
  'scales', 'shield', 'hive', 'flask', 'recap',
];

export function initScene(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050b18, 9, 22);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 0.5, 9.4);

  scene.add(new THREE.AmbientLight(0x223355, 1.1));
  const key = new THREE.DirectionalLight(0xf2f6fc, 1.4);
  key.position.set(4, 6, 6);
  scene.add(key);
  const gold = new THREE.PointLight(GOLD, 22, 14);
  gold.position.set(-5, 2, 4);
  const cyan = new THREE.PointLight(CYAN, 22, 14);
  cyan.position.set(5, -2, 4);
  scene.add(gold, cyan);

  // ---- stage objects on an arc -------------------------------------------
  const stages = new Map(); // objectKey -> {group, anchor, chapterIds, targetScale}
  const chapterToKey = new Map();
  ORDER.forEach((key, i) => {
    const builder = BUILDERS[key];
    if (!builder) return;
    const built = builder();
    const a = (i / (ORDER.length - 1)) * Math.PI * 1.35 - Math.PI * 0.18;
    const anchor = new THREE.Vector3(
      Math.sin(a) * 4.6,
      (i % 2 === 0 ? 0.45 : -0.45) + Math.sin(i * 1.7) * 0.2,
      -Math.cos(a) * 3.4,
    );
    built.group.position.copy(anchor);
    if (key === 'constellation') built.group.position.set(0, 0.2, -4.5);
    built.group.scale.setScalar(0.62);
    scene.add(built.group);
    stages.set(key, { ...built, anchor, targetScale: 0.62 });
  });

  // ---- the request packet + path -----------------------------------------
  const anchors = ORDER.map((k) => stages.get(k).anchor);
  const curve = new THREE.CatmullRomCurve3(anchors, false, 'catmullrom', 0.35);
  const pathLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(160)),
    new THREE.LineBasicMaterial({ color: 0x93a5c4, transparent: true, opacity: 0.28 }),
  );
  scene.add(pathLine);

  const packet = new THREE.Group();
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: CYAN, emissiveIntensity: 2.2 }),
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 20, 16),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.16 }),
  );
  const packetLight = new THREE.PointLight(CYAN, 16, 5);
  packet.add(orb, halo, packetLight);
  packet.position.copy(anchors[0]);
  scene.add(packet);

  // ---- interaction state --------------------------------------------------
  let activeKey = ORDER[0];
  const targetLook = new THREE.Vector3().copy(anchors[0]);
  const currentLook = new THREE.Vector3().copy(anchors[0]);
  const pointer = { x: 0, y: 0 };
  let progress = 0;
  let reduced = reducedMotion;

  function focusChapter(objectKey) {
    if (!stages.has(objectKey)) return;
    activeKey = objectKey;
    stages.forEach((st, k) => { st.targetScale = k === objectKey ? 1.06 : 0.6; });
    targetLook.copy(stages.get(objectKey).anchor);
  }

  function setProgress(p) {
    progress = Math.min(1, Math.max(0, p));
    if (reduced) packet.position.copy(curve.getPoint(progress));
  }

  function pulseStage(objectKey) {
    const st = stages.get(objectKey);
    if (!st) return;
    st.targetScale = 1.35;
    setTimeout(() => { st.targetScale = objectKey === activeKey ? 1.06 : 0.6; }, 420);
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
    stages.forEach((st) => {
      const s = st.group.scale.x + (st.targetScale - st.group.scale.x) * Math.min(1, dt * 6);
      st.group.scale.setScalar(s);
      st.animate(t, dt);
    });
    if (!reduced) {
      packet.position.copy(curve.getPoint(progress));
      halo.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
    }
    currentLook.lerp(targetLook, Math.min(1, dt * 3));
    camera.lookAt(currentLook);
    camera.position.x += (pointer.x * 0.55 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (0.5 - pointer.y * 0.35 - camera.position.y) * Math.min(1, dt * 2);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  return {
    focusChapter,
    setProgress,
    pulseStage,
    set onStageClick(cb) { onStageClick = cb; },
    dispose() { renderer.dispose(); },
  };
}
