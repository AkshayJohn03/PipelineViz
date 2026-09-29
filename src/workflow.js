/**
 * workflow.js — renders the explicit workflow diagrams:
 *   1. a per-chapter flow (boxes + arrows + keyword chips) inside the story,
 *   2. a persistent bottom stepper showing where you are in the whole journey.
 * Keyword chips reuse the glossary tooltip system (data-term buttons).
 */

export function flowEl(flow) {
  const wrap = document.createElement('div');
  wrap.className = 'flow';
  if (flow.caption) {
    const cap = document.createElement('p');
    cap.className = 'flow-caption';
    cap.textContent = flow.caption;
    wrap.appendChild(cap);
  }
  const ol = document.createElement('ol');
  ol.className = 'flow-steps';
  flow.steps.forEach((step, i) => {
    const li = document.createElement('li');
    li.className = 'flow-step';
    const box = document.createElement('div');
    box.className = 'flow-box';
    const idx = document.createElement('span');
    idx.className = 'flow-idx';
    idx.textContent = String(i + 1).padStart(2, '0');
    const label = document.createElement('span');
    label.className = 'flow-label';
    label.textContent = step.k;
    box.append(idx, label);
    if (step.t?.length) {
      const chips = document.createElement('div');
      chips.className = 'flow-chips';
      step.t.forEach((id) => {
        const b = document.createElement('button');
        b.className = 'term chip';
        b.dataset.term = id;
        b.textContent = id.replace(/-/g, ' ');
        chips.appendChild(b);
      });
      box.appendChild(chips);
    }
    li.appendChild(box);
    if (step.out) {
      const out = document.createElement('div');
      out.className = 'flow-out';
      out.textContent = `↳ ${step.out}`;
      li.appendChild(out);
    }
    ol.appendChild(li);
  });
  wrap.appendChild(ol);
  return wrap;
}

export function renderChapterFlow(section, flow) {
  if (!flow) return;
  const el = flowEl(flow);
  el.classList.add('panel', 'in');
  const rail = section.querySelector('.rail');
  if (rail) rail.insertBefore(el, rail.children[1] || null); // right after the header
}

export function buildStepper(STEPPER, onJump) {
  const bar = document.createElement('nav');
  bar.id = 'stepper';
  bar.setAttribute('aria-label', 'Platform workflow — your position in the journey');
  bar.innerHTML = '<span class="st-title">the workflow</span>';
  const list = document.createElement('ol');
  STEPPER.forEach((node, i) => {
    const li = document.createElement('li');
    li.dataset.chapter = node.id;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = `<span class="st-idx">${String(i + 1).padStart(2, '0')}</span><span class="st-k">${node.k}</span>`;
    btn.addEventListener('click', () => onJump(node.id));
    li.appendChild(btn);
    list.appendChild(li);
  });
  bar.appendChild(list);
  return bar;
}

export function setStepperActive(root, chapterId) {
  root.querySelectorAll('li').forEach((li) => {
    li.classList.toggle('active', li.dataset.chapter === chapterId);
    li.classList.toggle('done', Number(li.dataset?.idx || 0) < 0); // placeholder
  });
  // mark all nodes before the active one as done
  const items = [...root.querySelectorAll('li')];
  const activeIdx = items.findIndex((li) => li.dataset.chapter === chapterId);
  items.forEach((li, i) => {
    li.classList.toggle('done', i < activeIdx);
  });
}
