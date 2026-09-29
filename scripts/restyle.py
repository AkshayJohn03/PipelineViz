"""One-shot restyle: calm palette, per-stage accents, spread stepper."""
import re

p = 'src/styles.css'
s = open(p, encoding='utf-8', newline='').read().replace('\r\n', '\n')

s = s.replace('--bg: #050B18;', '--bg: #0A0F1A;')
s = s.replace('--bg-2: #081632;', '--bg-2: #0D1424;')
s = s.replace('--card: rgba(8, 22, 50, 0.72);', '--card: rgba(13, 18, 32, 0.86);')
s = s.replace('--ink: #F2F6FC;', '--ink: #E9EEF7;')
s = s.replace('--muted: #93A5C4;', '--muted: #8B96AB;')
s = s.replace('--gold: #FFB81C;', '--gold: #E8B44A;')
s = s.replace('--cyan: #00E5FF;', '--accent: #7DD3FC; --cyan: #5EC8E8;')
s = s.replace('--danger: #E5484D;', '--danger: #F87171;')
s = s.replace('--ok: #2FBF71;', '--ok: #4ADE80;')
s = s.replace('--hairline: rgba(147, 165, 196, 0.22);', '--hairline: rgba(139, 150, 171, 0.28);')
s = s.replace('--panel-w: min(480px, 92vw);', '--panel-w: min(560px, 94vw);')
s = s.replace('rgba(5, 11, 24, 0.55) 100%)', 'rgba(10, 15, 26, 0.55) 100%)')
s = s.replace('rgba(5,11,24,0.35), transparent 18%, transparent 82%, rgba(5,11,24,0.5)',
              'rgba(10,15,26,0.4), transparent 18%, transparent 82%, rgba(10,15,26,0.55)')
s = s.replace('background: linear-gradient(180deg, rgba(5,11,24,0.9), rgba(5,11,24,0));',
              'background: linear-gradient(180deg, rgba(10,15,26,0.92), rgba(10,15,26,0));')
s = s.replace('.brand span { color: var(--gold); }', '.brand span { color: var(--accent); }')
s = s.replace('.ch-num {\n  font-family: var(--mono); font-size: 0.7rem; color: var(--gold);',
              '.ch-num {\n  font-family: var(--mono); font-size: 0.7rem; color: var(--accent);')
s = s.replace('.numbers .v { font-family: var(--mono); font-size: 1.25rem; font-weight: 600; color: var(--gold); }',
              '.numbers .v { font-family: var(--mono); font-size: 1.25rem; font-weight: 600; color: var(--accent); }')
s = s.replace('border-left: 3px solid var(--cyan);\n  background: rgba(0, 229, 255, 0.06);\n  font-family: var(--mono); font-size: 0.85rem; color: var(--cyan);',
              'border-left: 3px solid var(--accent);\n  background: color-mix(in srgb, var(--accent) 7%, transparent);\n  font-family: var(--mono); font-size: 0.85rem; color: var(--ink);')
s = s.replace('.panel code, .mono { font-family: var(--mono); font-size: 0.82em; color: var(--gold); background: rgba(255,184,28,0.08); padding: 0.05em 0.35em; border-radius: 4px; }',
              '.panel code, .mono { font-family: var(--mono); font-size: 0.82em; color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); padding: 0.05em 0.35em; border-radius: 4px; }')
s = s.replace('section.chapter { position: relative; }',
              'section.chapter { position: relative; --accent: #94A3B8; }')
s = s.replace('background: #0B1B3A; color: var(--ink);', 'background: #111a2c; color: var(--ink);')
s = s.replace('border: 1px solid rgba(0, 229, 255, 0.4); border-radius: 10px;',
              'border: 1px solid color-mix(in srgb, var(--accent, #7DD3FC) 45%, transparent); border-radius: 10px;')
s = s.replace('#tooltip .tt-id { display: block; font-family: var(--mono); font-size: 0.62rem; color: var(--gold);',
              '#tooltip .tt-id { display: block; font-family: var(--mono); font-size: 0.62rem; color: var(--accent, #7DD3FC);')
s = s.replace('border: 1px solid rgba(255, 184, 28, 0.45);',
              'border: 1px solid color-mix(in srgb, var(--accent, #7DD3FC) 45%, transparent);')
s = s.replace('#facts .k { font-family: var(--mono); font-size: 0.72rem; color: var(--gold);',
              '#facts .k { font-family: var(--mono); font-size: 0.72rem; color: var(--accent, #7DD3FC);')
s = s.replace('.flow-caption {\n  font-family: var(--mono); font-size: 0.68rem; color: var(--gold);',
              '.flow-caption {\n  font-family: var(--mono); font-size: 0.68rem; color: var(--accent);')
s = s.replace('border: 1px solid var(--hairline); border-left: 3px solid var(--cyan);\n  background: rgba(8, 22, 50, 0.55);',
              'border: 1px solid var(--hairline); border-left: 3px solid var(--accent);\n  background: rgba(13, 18, 32, 0.6);')
s = s.replace('border: 1px dotted rgba(0,229,255,0.5); border-radius: 999px;\n  color: var(--cyan); background: rgba(0,229,255,0.05);',
              'border: 1px dotted color-mix(in srgb, var(--accent) 55%, transparent); border-radius: 999px;\n  color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, transparent);')
s = s.replace('width: 1px; background: linear-gradient(180deg, var(--cyan), rgba(0,229,255,0.15));',
              'width: 1px; background: linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 15%, transparent));')
s = s.replace("content: '\u25bc'; position: absolute; left: 0.1rem; bottom: 0.42rem;\n  color: rgba(0,229,255,0.65); font-size: 0.5rem;",
              "content: '\u25bc'; position: absolute; left: 0.1rem; bottom: 0.42rem;\n  color: color-mix(in srgb, var(--accent) 70%, transparent); font-size: 0.5rem;")
s = s.replace('.flow-idx { font-family: var(--mono); font-size: 0.62rem; color: var(--gold); }',
              '.flow-idx { font-family: var(--mono); font-size: 0.62rem; color: var(--accent); }')
s = s.replace('.term-demo { color: var(--cyan); border-bottom: 1px dotted var(--cyan); cursor: help; }',
              '.term-demo { color: var(--accent); border-bottom: 1px dotted var(--accent); cursor: help; }')

# replace the whole stepper block with the calm, full-width spread version
start = s.index('#stepper {')
end = s.index("#stepper li.done .st-k::after")
end = s.index('}', end) + 1
new_stepper = """#stepper {
  position: fixed; z-index: 25; left: 50%; bottom: 0.9rem; transform: translateX(-50%);
  display: flex; align-items: center; gap: 0.55rem;
  width: min(1240px, 97vw); padding: 0.55rem 0.9rem;
  background: rgba(13, 18, 32, 0.92); border: 1px solid var(--hairline);
  border-radius: 16px; backdrop-filter: blur(12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  overflow-x: auto; scrollbar-width: none;
}
#stepper::-webkit-scrollbar { display: none; }
#stepper .st-title {
  font-family: var(--mono); font-size: 0.6rem; color: var(--muted);
  letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap;
  writing-mode: vertical-rl; transform: rotate(180deg);
}
#stepper ol { display: flex; gap: 0.3rem; list-style: none; margin: 0; padding: 0; flex: 1; justify-content: space-between; }
#stepper li { position: relative; flex: 1; }
#stepper li + li::before {
  content: ''; position: absolute; left: -0.42rem; top: 50%;
  width: 0.84rem; height: 1px; background: rgba(139,150,171,0.4);
}
#stepper button {
  width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.05rem;
  background: none; border: 1px solid transparent; border-radius: 10px;
  padding: 0.3rem 0.3rem; cursor: pointer; color: var(--muted);
  border-bottom: 2px solid transparent;
}
#stepper .st-idx { font-family: var(--mono); font-size: 0.55rem; opacity: 0.7; }
#stepper .st-k { font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
#stepper li.active button {
  color: var(--st-color, #E8B44A); border-bottom-color: var(--st-color, #E8B44A);
  background: color-mix(in srgb, var(--st-color, #E8B44A) 8%, transparent);
}
#stepper li.done button { color: #5F6B80; }
#stepper li.done .st-k::after { content: ' \\2713'; font-size: 0.6rem; color: var(--ok); }"""
s = s[:start] + new_stepper + s[end:]

open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('styles reworked OK')
