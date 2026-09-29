/**
 * objects.js — procedural 3D builders for each chapter's stage object.
 * No external assets: everything is primitive geometry + emissive materials,
 * so the site stays a pure static build.
 */
import * as THREE from 'three';

const GOLD = 0xffb81c;
const CYAN = 0x00e5ff;
const INK = 0x0b1b3a;

export function mat(color, emissive = 0x000000, intensity = 0.0, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: intensity,
    roughness: 0.35, metalness: 0.55, ...opts,
  });
}

function group(...children) {
  const g = new THREE.Group();
  children.forEach((c) => g.add(c));
  return g;
}

/* Each builder returns { group, animate(t, dt) } where animate drives idle
   motion. The engine handles active/dim state (scale + emissive boost). */

export function buildConstellation() {
  const pts = [];
  const N = 90;
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / N);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 3.1;
    pts.push(new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.8,
      r * Math.sin(phi) * Math.sin(theta),
    ));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({
    color: CYAN, size: 0.05, transparent: true, opacity: 0.85,
  }));
  const links = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.4, 1)),
    new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.18 }),
  );
  const g = group(stars, links);
  return {
    group: g,
    animate(t) { g.rotation.y = t * 0.06; links.rotation.x = Math.sin(t * 0.12) * 0.1; },
  };
}

export function buildBadge() {
  const card = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.3, 0.09), mat(INK, CYAN, 0.35));
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.05, 12, 32),
    mat(GOLD, GOLD, 0.9),
  );
  ring.position.set(0, 0.75, 0.09);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.16, 0.06), mat(0x2fbf71, 0x2fbf71, 0.7));
  strip.position.set(0, 0.05, 0.07);
  const strip2 = strip.clone(); strip2.position.y = -0.28; strip2.scale.x = 0.8;
  const strip3 = strip.clone(); strip3.position.y = -0.55; strip3.scale.x = 0.55; strip3.material = mat(0x93a5c4, 0x93a5c4, 0.4);
  const g = group(card, ring, strip, strip2, strip3);
  return {
    group: g,
    animate(t) { g.rotation.y = Math.sin(t * 0.4) * 0.45; g.rotation.x = Math.sin(t * 0.3) * 0.12; },
  };
}

export function buildGateway() {
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 0.5), mat(INK, CYAN, 0.22));
  const slots = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const lever = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.5, 10),
        mat(j === 1 ? GOLD : CYAN, j === 1 ? GOLD : CYAN, 0.8),
      );
      lever.rotation.z = Math.PI / 2;
      lever.position.set(-0.75 + i * 0.75, j === 0 ? 0.45 : -0.45, 0.3);
      slots.push(lever);
    }
  }
  const g = group(base, ...slots);
  return {
    group: g,
    animate(t) {
      g.rotation.y = Math.sin(t * 0.25) * 0.4;
      slots.forEach((s, i) => { s.position.z = 0.3 + Math.sin(t * 1.6 + i * 1.3) * 0.12; });
    },
  };
}

export function buildBook() {
  const cover = mat(0x101f42, CYAN, 0.18);
  const front = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.5, 0.08), cover);
  front.position.z = 0.18; front.rotation.x = -0.06;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.5, 0.42), mat(GOLD, GOLD, 0.55));
  spine.position.x = -0.95;
  const pages = [];
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(
      new THREE.BoxGeometry(1.7 - i * 0.1, 2.3, 0.02),
      mat(0xe8eefc, 0x8899cc, 0.12),
    );
    p.position.set(0.05, 0, 0.1 + i * 0.035 - 0.06);
    p.rotation.x = -0.06 - i * 0.02;
    pages.push(p);
  }
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.03), mat(0x2fbf71, 0x2fbf71, 0.8));
  tab.position.set(0.4, 1.0, 0.16);
  const g = group(front, spine, ...pages, tab);
  return {
    group: g,
    animate(t) { g.rotation.y = -0.35 + Math.sin(t * 0.3) * 0.28; g.rotation.x = Math.sin(t * 0.2) * 0.08; },
  };
}

export function buildMagnifier() {
  const lens = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.11, 14, 48),
    mat(GOLD, GOLD, 0.8),
  );
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.82, 40),
    new THREE.MeshStandardMaterial({
      color: 0x9be8ff, transparent: true, opacity: 0.22,
      emissive: CYAN, emissiveIntensity: 0.25, side: THREE.DoubleSide,
    }),
  );
  glass.position.z = 0.01;
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.13, 1.4, 12),
    mat(CYAN, CYAN, 0.5),
  );
  handle.position.set(0.95, -1.05, 0); handle.rotation.z = Math.PI / 4;
  const g = group(lens, glass, handle);
  return {
    group: g,
    animate(t) { g.rotation.y = Math.sin(t * 0.35) * 0.5; g.position.y = Math.sin(t * 0.8) * 0.08; },
  };
}

export function buildScales() {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.4, 12), mat(CYAN, CYAN, 0.5));
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.12), mat(GOLD, GOLD, 0.75));
  beam.position.y = 1.15;
  const panGeo = new THREE.CylinderGeometry(0.5, 0.42, 0.16, 24);
  const panL = new THREE.Mesh(panGeo, mat(0x16305e, CYAN, 0.35));
  const panR = panL.clone();
  panL.position.set(-1.2, 0.55, 0); panR.position.set(1.2, 0.55, 0);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.18, 24), mat(INK, GOLD, 0.3));
  base.position.y = -1.2;
  const g = group(post, beam, panL, panR, base);
  return {
    group: g,
    animate(t) {
      const tilt = Math.sin(t * 0.7) * 0.14;
      beam.rotation.z = tilt;
      panL.position.y = 0.55 - Math.sin(tilt) * 1.2;
      panR.position.y = 0.55 + Math.sin(tilt) * 1.2;
      g.rotation.y = Math.sin(t * 0.22) * 0.4;
    },
  };
}

export function buildShield() {
  // six defense layers = six nested octagon rings around a core
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), mat(GOLD, GOLD, 1.0));
  const layers = [];
  for (let i = 0; i < 6; i++) {
    const r = 0.85 + i * 0.32;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.035, 10, 8),
      mat(i % 2 ? CYAN : 0x93a5c4, i % 2 ? CYAN : 0x93a5c4, 0.55),
    );
    ring.rotation.x = Math.PI / 2;
    ring.userData.layerIndex = i;
    layers.push(ring);
  }
  const g = group(core, ...layers);
  return {
    group: g,
    animate(t) {
      g.rotation.y = t * 0.14;
      layers.forEach((ring, i) => {
        ring.rotation.z = t * (0.1 + i * 0.05) * (i % 2 ? 1 : -1);
        ring.position.y = Math.sin(t * 0.9 + i) * 0.04;
      });
    },
  };
}

export function buildHive() {
  const nodes = [];
  const edges = [];
  const levels = [0, 1, 2, 1];
  levels.forEach((lv, li) => {
    const count = lv === 0 ? 1 : lv * 3;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + li;
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(lv === 0 ? 0.3 : 0.16, 18, 14),
        mat(lv === 0 ? GOLD : CYAN, lv === 0 ? GOLD : CYAN, 0.8),
      );
      const r = 0.6 + lv * 0.75;
      node.position.set(Math.cos(a) * r, (levels.length - 1) * 0.42 - li * 0.84, Math.sin(a) * r);
      nodes.push(node);
    }
  });
  const linkMat = new THREE.LineBasicMaterial({ color: 0x93a5c4, transparent: true, opacity: 0.35 });
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[0].position, b = nodes[i].position;
    edges.push(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([a, b]), linkMat,
    ));
  }
  const g = group(...nodes, ...edges);
  return {
    group: g,
    animate(t) { g.rotation.y = t * 0.18; },
  };
}

export function buildFlask() {
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbfe9ff, transparent: true, opacity: 0.3, roughness: 0.1,
    emissive: CYAN, emissiveIntensity: 0.15, side: THREE.DoubleSide,
  });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.9, 18), glassMat);
  neck.position.y = 1.15;
  const body = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.9, 26, 1, true), glassMat);
  body.position.y = -0.2; body.rotation.x = Math.PI;
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.88, 0.8, 26),
    mat(GOLD, GOLD, 0.85, { transparent: true, opacity: 0.85 }),
  );
  liquid.position.y = -0.75;
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), mat(0xffffff, GOLD, 1.0));
  const g = group(neck, body, liquid, bubble);
  return {
    group: g,
    animate(t) {
      g.rotation.y = Math.sin(t * 0.3) * 0.5;
      bubble.position.y = -1.0 + ((t * 0.35) % 1) * 1.3;
      bubble.material.opacity = 1 - ((t * 0.35) % 1);
    },
  };
}

export function buildRecap() {
  // mini pipeline: the full journey in one object
  const boxes = [];
  const labels = 7;
  for (let i = 0; i < labels; i++) {
    const a = (i / labels) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat(INK, i % 2 ? GOLD : CYAN, 0.6));
    b.position.set(Math.cos(a) * 1.9, Math.sin(a * 2) * 0.5, Math.sin(a) * 1.9);
    boxes.push(b);
  }
  const pathPts = boxes.map((b) => b.position);
  const loop = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pathPts.concat([pathPts[0]])),
    new THREE.LineBasicMaterial({ color: 0x93a5c4, transparent: true, opacity: 0.5 }),
  );
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 16), mat(0xffffff, CYAN, 0.7));
  const g = group(...boxes, loop, core);
  return {
    group: g,
    animate(t) {
      g.rotation.y = t * 0.16; g.rotation.x = Math.sin(t * 0.1) * 0.15;
      boxes.forEach((b, i) => { const s = 1 + Math.sin(t * 1.4 + i) * 0.08; b.scale.setScalar(s); });
    },
  };
}

export const BUILDERS = {
  constellation: buildConstellation,
  badge: buildBadge,
  gateway: buildGateway,
  book: buildBook,
  magnifier: buildMagnifier,
  scales: buildScales,
  shield: buildShield,
  hive: buildHive,
  flask: buildFlask,
  recap: buildRecap,
};
