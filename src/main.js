/**
 * main.js — builds the story DOM from journey.js, wires GSAP ScrollTrigger
 * (panel reveals, chapter focus, scroll → packet progress), the glossary
 * tooltips, the facts card and the replay button.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { META, CHAPTERS, FOOTER } from './data/journey.js';
import { TERMS } from './data/terms.js';
import { initScene } from './three/scene.js';
import { FLOWS, STEPPER } from './data/flows.js';
import { STAGES } from './data/palette.js';
import { renderChapterFlow, buildStepper, setStepperActive } from './workflow.js';

import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ story */
const story = document.getElementById('story');
const sections = [];

CHAPTERS.forEach((ch) => {
  const section = document.createElement('section');
  section.className = `chapter side-${ch.side}`;
  section.id = ch.id;
  section.style.minHeight = `${Math.min(ch.height || 220, 320)}vh`;

  const rail = document.createElement('div');
  rail.className = 'rail';

  const head = document.createElement('div');
  head.className = 'panel in'; // chapter header is always visible
  head.innerHTML = `
    <div class="ch-num">${ch.kicker || `CH ${ch.num}`}</div>
    <h2>${ch.title}</h2>`;
  rail.appendChild(head);

  (ch.panels || []).forEach((p) => {
    const el = document.createElement('article');
    el.className = 'panel';
    el.innerHTML = `<h2>${p.title}</h2>${p.html}`;
    rail.appendChild(el);
  });

  if (ch.numbers?.length) {
    const nums = document.createElement('div');
    nums.className = 'numbers';
    nums.innerHTML = ch.numbers
      .map((n) => `<div><span class="v">${n.v}</span><span class="k">${n.k}</span></div>`)
      .join('');
    const wrap = document.createElement('div');
    wrap.className = 'panel in';
    wrap.appendChild(nums);
    rail.appendChild(wrap);
  }

  section.appendChild(rail);
  story.appendChild(section);
  sections.push({ ch, section, panels: [...rail.querySelectorAll('.panel')] });

  // explicit workflow diagram for this chapter (boxes + arrows + keyword chips)
  if (FLOWS[ch.id]) renderChapterFlow(section, FLOWS[ch.id]);
});

// persistent bottom stepper — where am I in the whole workflow?
const stepperColors = {
  ch1: STAGES.ch1.color, ch2: STAGES.ch2.color, ch3: STAGES.ch3.color,
  ch4: STAGES.ch4.color, ch5: STAGES.ch5.color, ch6: STAGES.ch6.color,
  ch7: STAGES.ch7.color, ch8: STAGES.ch8.color,
};
const stepper = buildStepper(STEPPER, (chapterId) => {
  const target = document.getElementById(chapterId)
    || document.getElementById(chapterId === 'ch7' ? 'ch7a' : chapterId);
  if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
});
document.body.appendChild(stepper);
stepper.querySelectorAll('li').forEach((li) => {
  const c = stepperColors[li.dataset.chapter];
  if (c) li.style.setProperty('--st-color', c);
});

const footer = document.getElementById('colophon');
footer.innerHTML = `
  <p class="l1">${FOOTER.line1}</p>
  <p>${META.owner} · <a href="${META.github}" target="_blank" rel="noopener">github.com/AkshayJohn03</a>
  · ${FOOTER.line2}</p>`;

/* ------------------------------------------------------------------ scene */
const canvas = document.getElementById('stage');
const scene = initScene(canvas, { reducedMotion });

const keyByChapter = new Map(CHAPTERS.map((c) => [c.id, c.object]));
const chapterByKey = new Map(CHAPTERS.map((c) => [c.object, c]));

/* ------------------------------------------------------------- tooltips */
const tooltip = document.getElementById('tooltip');
function showTooltip(target) {
  const id = target.dataset.term;
  const text = TERMS[id];
  if (!text) return;
  tooltip.innerHTML = `<span class="tt-id">${id.replace(/-/g, ' ')}</span><p>${text}</p>`;
  const r = target.getBoundingClientRect();
  const above = r.top > 180;
  tooltip.style.left = `${Math.min(window.innerWidth - 340, Math.max(8, r.left))}px`;
  tooltip.style.top = above ? `${r.top - 8}px` : `${r.bottom + 8}px`;
  tooltip.style.transform = above ? 'translateY(-100%)' : 'translateY(0)';
  tooltip.classList.add('show');
  tooltip.setAttribute('aria-hidden', 'false');
}
function hideTooltip() {
  tooltip.classList.remove('show');
  tooltip.setAttribute('aria-hidden', 'true');
}
document.addEventListener('mouseover', (e) => {
  const t = e.target.closest('.term');
  if (t) showTooltip(t);
});
document.addEventListener('mouseout', (e) => {
  if (e.target.closest('.term')) hideTooltip();
});
document.addEventListener('touchstart', (e) => {
  const t = e.target.closest('.term');
  if (t) { showTooltip(t); setTimeout(hideTooltip, 3500); }
}, { passive: true });

/* ------------------------------------------------------- facts card */
const facts = document.getElementById('facts');
scene.onStageClick = (objectKey) => {
  const ch = chapterByKey.get(objectKey);
  if (!ch) return;
  facts.querySelector('.k').textContent = ch.kicker || ch.title;
  facts.querySelector('.fl').innerHTML = (ch.facts || []).map((f) => `<li>${f}</li>`).join('');
  facts.classList.add('show');
  facts.setAttribute('aria-hidden', 'false');
  scene.pulseStage(objectKey);
};
document.getElementById('facts-close').addEventListener('click', () => {
  facts.classList.remove('show');
  facts.setAttribute('aria-hidden', 'true');
});

/* ------------------------------------------------------- GSAP scroll */
const progressTag = document.getElementById('progress-tag');

function setChapterActive(chId) {
  const ch = CHAPTERS.find((c) => c.id === chId);
  if (!ch) return;
  scene.focusChapter(ch.object);
  progressTag.textContent = `ch ${ch.num} · ${(ch.kicker || ch.title).replace(/^CH \d+ · /, '')}`;
  const stepperId = chId.startsWith('ch7') ? 'ch7' : chId;
  setStepperActive(stepper, stepperId);
  // the chapter's accent color drives its panels, flow boxes and chips
  section.style.setProperty('--accent', STAGES[chId]?.color || '#94A3B8');
}

sections.forEach(({ ch, section, panels }) => {
  panels.forEach((p) => {
    if (p.classList.contains('in')) return;
    ScrollTrigger.create({
      trigger: p,
      start: 'top 82%',
      end: 'bottom 30%',
      onEnter: () => p.classList.add('in'),
      onLeaveBack: () => p.classList.remove('in'),
    });
  });
  ScrollTrigger.create({
    trigger: section,
    start: 'top 55%',
    end: 'bottom 45%',
    onToggle: (self) => { if (self.isActive) setChapterActive(ch.id); },
  });
});

// global scroll progress → packet position, as an explicit GSAP scrub so the
// 3D journey IS the GSAP animation (smoothed 0.4s behind the scroll)
const journeyProxy = { p: 0 };
gsap.to(journeyProxy, {
  p: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: '#story',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
  },
  onUpdate: () => scene.setProgress(journeyProxy.p),
});
scene.setProgress(0);

setChapterActive(CHAPTERS[0].id);

/* ------------------------------------------------------- replay journey */
const replayBtn = document.getElementById('replay');
replayBtn.addEventListener('click', () => {
  replayBtn.disabled = true;
  const proxy = { p: 0 };
  const perChapter = 0.75;
  const tl = gsap.timeline({
    onComplete: () => { replayBtn.disabled = false; },
  });
  CHAPTERS.forEach((ch, i) => {
    const target = i / (CHAPTERS.length - 1);
    tl.to(proxy, {
      p: target, duration: perChapter, ease: 'none',
      onUpdate: () => scene.setProgress(proxy.p),
    }, i * perChapter);
    tl.add(() => {
      setChapterActive(ch.id);
      scene.pulseStage(ch.object);
    }, i * perChapter + perChapter * 0.5);
  });
  tl.to({}, { duration: 0.4 }); // breath before handing control back to scroll
  tl.add(() => ScrollTrigger.refresh());
});

ScrollTrigger.refresh();
