/**
 * flows.js — the explicit workflow diagrams. One flow per chapter: an ordered
 * list of steps; each step renders as a box, arrows connect them, and every
 * step carries its keywords as tooltip chips. This is the "solution workflow"
 * view: boxes and arrows, readable first, 3D second.
 *
 * Step shape: { k: label, t: [termIds], out?: branch note }
 * A step may have `branch`: a small fork rendered under the box
 * (e.g. cache hit → return early).
 */

export const FLOWS = {
  ch1: {
    caption: 'Workflow — prove who is asking, before anything else',
    steps: [
      { k: 'Request arrives', t: [], out: 'no credential' },
      { k: 'Check the badge', t: ['jwt'], out: 'expired / forged' },
      { k: 'Match the keycard', t: ['api-key', 'sha256', 'constant-time'], out: 'unknown key' },
      { k: 'Name the tenant', t: ['tenant', 'key-rotation'], out: 'fail → 401, fail-closed' },
      { k: 'Request allowed through', t: [], out: 'identity stamped on every later step' },
    ],
  },
  ch2: {
    caption: 'Workflow — the gateway decides: allowed? cached? which model? at what cost?',
    steps: [
      { k: 'Rate limit', t: ['token-bucket', 'rate-limit', 'http-429'], out: 'bucket empty → 429 + Retry-After' },
      { k: 'Cache lookup', t: ['semantic-cache', 'cosine', 'embedding'], out: 'similar question → instant answer' },
      { k: 'Budget check', t: ['autopilot', 'burn-projection', 'ledger'], out: 'hard budget → downgrade or deny' },
      { k: 'Pick the model', t: ['feature-flag', 'hash-bucketing', 'kill-switch', 'shadow-mode'], out: 'kill switch → 0% traffic' },
      { k: 'Call with resilience', t: ['circuit-breaker', 'half-open', 'fallback', 'hedging'], out: 'provider down → next on the chain' },
      { k: 'Meter & remember', t: ['ledger', 'wal'], out: 'append-only receipt, survives restarts' },
    ],
  },
  ch3: {
    caption: 'Workflow — from a question to a cited, safety-checked answer',
    steps: [
      { k: 'Understand the question', t: ['fault-code', 'fast-path', 'slang'], out: 'exact code hit → table row, done' },
      { k: 'Search two ways', t: ['bm25', 'dense', 'chunking'], out: '' },
      { k: 'Fuse the rankings', t: ['rrf', 'reranker', 'breadcrumb'], out: '' },
      { k: 'Safety gate', t: ['safety-tagged', 'grounded-refusal', 'spec-exemption'], out: 'no safety source → escalate to a human' },
      { k: 'Compose the answer', t: ['citation', 'grounding', 'faithfulness'], out: 'every claim carries its receipt' },
    ],
  },
  ch4: {
    caption: 'Workflow — every request leaves a record; failures get names',
    steps: [
      { k: 'Collect the spans', t: ['trace', 'span'], out: '' },
      { k: 'Name the failure', t: ['taxonomy'], out: '' },
      { k: 'Blame the stage', t: ['blame'], out: '' },
      { k: 'Watch the slow leak', t: ['chi-square', 'drift'], out: 'failure mix shifted → alarm' },
      { k: 'Write the report', t: [], out: 'RCA a manager can read' },
    ],
  },
  ch5: {
    caption: 'Workflow — how an answer earns a release',
    steps: [
      { k: 'Run the golden exam', t: ['golden-set', 'decontamination'], out: '' },
      { k: 'Grade with a rubric', t: ['rubric', 'position-bias'], out: '' },
      { k: 'Check against humans', t: ['kappa', 'isotonic'], out: '' },
      { k: 'Prove the improvement', t: ['bootstrap', 'regression-gate'], out: 'worse than baseline → release blocked (exit 1)' },
    ],
  },
  ch6: {
    caption: 'Workflow — attack it yourself before they do',
    steps: [
      { k: 'Smuggle the payload', t: ['injection'], out: 'hidden inside a resume' },
      { k: 'Layer the defenses', t: ['scanner', 'spotlighting', 'hierarchy', 'firewall'], out: '' },
      { k: 'Detect the leak', t: ['canary', 'scrubbing'], out: 'canary outside → prompt leaked' },
      { k: 'Measure & gate', t: [], out: 'ASR 92% → 0%, CI blocks regressions' },
    ],
  },
  ch7a: {
    caption: 'Workflow — a research team, coordinated as a graph',
    steps: [
      { k: 'Plan the work', t: ['dag'], out: '' },
      { k: 'Search in parallel', t: [], out: '' },
      { k: 'Read with receipts', t: ['receipts'], out: '' },
      { k: 'Verify before writing', t: [], out: 'unverifiable claim → re-task, not guess' },
      { k: 'Cited report', t: [], out: 'hallucination rate 0.0' },
    ],
  },
  ch7b: {
    caption: 'Workflow — the cost loop: stop paying master prices for easy questions',
    steps: [
      { k: 'Autopilot flags easy work', t: ['autopilot'], out: '' },
      { k: 'Teacher writes the textbook', t: ['rejection'], out: '' },
      { k: 'Clean the data', t: ['minhash', 'decontamination'], out: 'exam leak removed' },
      { k: 'Train the student', t: ['qlora', 'distillation'], out: '' },
      { k: 'Certify & route', t: ['regression-gate'], out: 'gateway sends easy tasks to the student' },
    ],
  },
  ch8: {
    caption: 'The whole workflow, one line',
    steps: [
      { k: 'Ask', t: [] },
      { k: 'Identify', t: ['jwt'] },
      { k: 'Protect & route', t: ['token-bucket', 'semantic-cache', 'circuit-breaker'] },
      { k: 'Retrieve & answer', t: ['rrf', 'citation'] },
      { k: 'Record & explain', t: ['trace', 'taxonomy'] },
      { k: 'Grade & gate', t: ['regression-gate'] },
      { k: 'Certified answer', t: [] },
    ],
  },
};

/** The persistent bottom stepper: the whole journey, always visible. */
export const STEPPER = [
  { id: 'ch1', k: 'Identity', t: ['jwt'] },
  { id: 'ch2', k: 'Gateway', t: ['token-bucket', 'semantic-cache', 'circuit-breaker'] },
  { id: 'ch3', k: 'Retrieve & answer', t: ['rrf', 'grounded-refusal'] },
  { id: 'ch4', k: 'Record', t: ['trace', 'taxonomy'] },
  { id: 'ch5', k: 'Grade & gate', t: ['regression-gate'] },
  { id: 'ch6', k: 'Attack-test', t: ['injection', 'canary'] },
  { id: 'ch7', k: 'Platform services', t: ['dag', 'distillation'] },
  { id: 'ch8', k: 'Certified answer', t: [] },
];
