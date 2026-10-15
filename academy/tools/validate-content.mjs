// Validates content files against docs/CONTENT_SPEC.md.
//   node academy/tools/validate-content.mjs            # all js/content/l*.js
//   node academy/tools/validate-content.mjs l3         # one level
import { readdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js', 'content');
const only = process.argv[2];
const WIDGETS = new Set(['tokenizer','nextword','contextwindow','attention','dotproduct','embeddings','neuron','nnplayground','gradient','sorter','claimcheck','flow','ragdemo','agentloop','promptlab','streaming','costcalc','evalmatrix','jsonschema','rlgrid','timeline','codeplay','quizcard']);
const BLOCKS = new Set(['p','h','list','steps','callout','widget','predict','try','reveal','code','compare','current']);
const QTYPES = new Set(['mcq','multi','order','short','code']);
const CALLOUT = new Set(['tip','warn','why','analogy','misconception']);
const RESTYLE = new Set(['analogy','simple','step-by-step','technical']);

let errors = 0, warns = 0;
const err = (f, m) => { errors++; console.error(`  ✗ ${f}: ${m}`); };
const warn = (f, m) => { warns++; console.warn(`  ! ${f}: ${m}`); };
const str = (v) => typeof v === 'string' && v.trim().length > 0;
const arr = (v) => Array.isArray(v);

const files = readdirSync(dir).filter((f) => /^l\d\.js$/.test(f) && (!only || f.startsWith(only)));
const allSkills = new Set();
const mods = [];
for (const f of files) {
  try { mods.push([f, (await import(pathToFileURL(path.join(dir, f)).href)).default]); }
  catch (e) { err(f, 'cannot import: ' + e.message); }
}
for (const [f, m] of mods) for (const s of m.skills || []) allSkills.add(s.id);
// when validating one level, still load all others for cross-level skill refs
if (only) for (const f of readdirSync(dir).filter((x) => /^l\d\.js$/.test(x) && !x.startsWith(only))) {
  try { for (const s of (await import(pathToFileURL(path.join(dir, f)).href)).default.skills || []) allSkills.add(s.id); } catch {}
}
const allCurrent = new Set();
for (const f of readdirSync(dir).filter((x) => /^(l\d|shared)\.js$/.test(x))) {
  try { for (const k of Object.keys((await import(pathToFileURL(path.join(dir, f)).href)).default.current || {})) allCurrent.add(k); } catch {}
}

const seenIds = new Set();
for (const [f, m] of mods) {
  console.log(`• ${f}`);
  const N = +f[1];
  if (!arr(m.skills) || m.skills.length < 6) err(f, 'skills: need ≥6 (8–14 expected)');
  (m.skills || []).forEach((s) => { if (!s.id?.startsWith(`l${N}.`) || !str(s.name) || !str(s.desc)) err(f, `skill ${s.id}: id must start "l${N}." and have name+desc`); });
  if (!arr(m.lessons) || m.lessons.length < 6) err(f, 'lessons: need ≥6 (7–10 expected)');
  if (!arr(m.projects) || !m.projects.length) err(f, 'projects: need ≥1');
  if (!arr(m.glossary) || m.glossary.length < 10) err(f, 'glossary: need ≥10');
  (m.glossary || []).forEach((g) => { if (!str(g.term) || !str(g.def)) err(f, 'glossary entry needs term+def'); else if (g.def.split(/\s+/).length > 45) warn(f, `glossary "${g.term}" def > 45 words`); });
  for (const [k, c] of Object.entries(m.current || {})) {
    if (!str(c.title) || !str(c.md) || !/^\d{4}-\d{2}$/.test(c.asOf || '') || !arr(c.sources) || !c.sources.length) err(f, `current.${k}: needs title, md, asOf (YYYY-MM), ≥1 source`);
    (c.sources || []).forEach((s) => { if (!/^https:\/\//.test(s.url || '') || !str(s.label)) err(f, `current.${k}: bad source`); });
  }
  for (const L of m.lessons || []) {
    const id = L.id || '(no id)';
    if (!new RegExp(`^l${N}-\\d\\d$`).test(id)) err(id, `lesson id must match l${N}-NN`);
    if (seenIds.has(id)) err(id, 'duplicate id'); seenIds.add(id);
    if (!str(L.title) || !str(L.hook)) err(id, 'title/hook missing');
    if (!(L.minutes >= 3 && L.minutes <= 40)) err(id, 'minutes should be 3–40');
    if (!arr(L.skills) || !L.skills.length) err(id, 'skills missing'); else L.skills.forEach((s) => allSkills.has(s) || err(id, `unknown skill ${s}`));
    if (!arr(L.blocks) || L.blocks.length < 6) err(id, 'need ≥6 blocks');
    let interactive = 0;
    (L.blocks || []).forEach((b, i) => {
      const w = `${id} block ${i}`;
      if (!BLOCKS.has(b.t)) return err(w, `unknown block type ${b.t}`);
      if (['widget', 'predict', 'try'].includes(b.t) || (b.t === 'widget')) interactive++;
      if (b.t === 'p' && (!str(b.md) || b.md.includes('\n'))) err(w, 'p.md must be a non-empty single-line string');
      if (b.t === 'h' && !str(b.text)) err(w, 'h.text');
      if (b.t === 'list' && (!arr(b.items) || !b.items.every(str))) err(w, 'list.items');
      if (b.t === 'steps' && (!arr(b.items) || !b.items.every((x) => str(x.title) && str(x.md)))) err(w, 'steps.items');
      if (b.t === 'callout' && (!CALLOUT.has(b.kind) || !str(b.md))) err(w, 'callout kind/md');
      if (b.t === 'widget') { if (!WIDGETS.has(b.w)) err(w, `unknown widget ${b.w}`); if (b.w === 'quizcard' && !(L.quiz || []).some((q) => q.id === b.props?.questionId)) err(w, 'quizcard questionId not in this lesson'); }
      if (b.t === 'predict' && (!str(b.q) || !arr(b.options) || b.options.length < 2 || !Number.isInteger(b.answer) || !b.options[b.answer] || !str(b.explain))) err(w, 'predict fields');
      if (b.t === 'try' && (!str(b.prompt) || !str(b.sample))) err(w, 'try.prompt/sample');
      if (b.t === 'reveal' && (!str(b.label) || !str(b.md))) err(w, 'reveal');
      if (b.t === 'code' && (!str(b.lang) || !str(b.src))) err(w, 'code.lang/src');
      if (b.t === 'compare' && (!arr(b.cols) || !arr(b.rows) || b.rows.some((r) => r.length !== b.cols.length))) err(w, 'compare rows must match cols');
      if (b.t === 'current' && !allCurrent.has(b.key)) err(w, `current key "${b.key}" not defined in any content file`);
    });
    if (interactive < 1) err(id, 'needs ≥1 interactive block (widget/predict/try) before the quiz');
    if (!arr(L.reteach) || L.reteach.length < 2 || !L.reteach.every((r) => RESTYLE.has(r.style) && str(r.md))) err(id, 'reteach: ≥2 entries with valid style + md');
    else if (!L.reteach.some((r) => r.style === 'analogy' || r.style === 'simple')) err(id, 'reteach needs an analogy or simple entry');
    if (!arr(L.takeaways) || L.takeaways.length < 3) err(id, 'takeaways ≥3');
    // quiz
    const qs = L.quiz || [];
    if (qs.length < 4) err(id, 'quiz needs ≥4 questions');
    if (new Set(qs.map((q) => q.type)).size < 2) err(id, 'quiz needs ≥2 question types');
    const covered = new Set(qs.map((q) => q.skill));
    (L.skills || []).forEach((s) => covered.has(s) || err(id, `no quiz question covers skill ${s}`));
    const recall = qs.filter((q) => q.difficulty === 1).length;
    if (recall > Math.ceil(qs.length / 2)) warn(id, 'too many difficulty-1 questions');
    for (const q of qs) {
      const w = q.id || `${id} question`;
      if (!new RegExp(`^${id}-q\\d+$`).test(q.id || '')) err(w, `id must be ${id}-qN`);
      if (seenIds.has(q.id)) err(w, 'duplicate id'); seenIds.add(q.id);
      if (!QTYPES.has(q.type)) { err(w, 'bad type'); continue; }
      if (!allSkills.has(q.skill)) err(w, `unknown skill ${q.skill}`);
      if (!str(q.q) || !str(q.explain)) err(w, 'q/explain');
      if (![1, 2, 3].includes(q.difficulty)) err(w, 'difficulty 1–3');
      if (!arr(q.hints) || !q.hints.length || !q.hints.every(str)) err(w, 'hints: ≥1');
      if (q.type === 'mcq' && (!arr(q.options) || q.options.length < 3 || q.options.length > 5 || !Number.isInteger(q.answer) || !q.options[q.answer])) err(w, 'mcq options/answer');
      if (q.type === 'multi' && (!arr(q.options) || !arr(q.answer) || !q.answer.length || q.answer.some((i) => !q.options[i]))) err(w, 'multi options/answer');
      if (q.type === 'order' && (!arr(q.items) || q.items.length < 3)) err(w, 'order items ≥3');
      if (q.type === 'short') { if (!arr(q.accept) || !q.accept.length || !str(q.model)) err(w, 'short accept/model'); else q.accept.forEach((r) => { try { new RegExp(r, 'i'); } catch { err(w, 'bad regex ' + r); } }); }
      if (q.type === 'code') {
        if (!str(q.fnName) || !str(q.starter) || !str(q.solution) || !arr(q.tests) || q.tests.length < 3) err(w, 'code needs fnName/starter/solution/≥3 tests');
        else try { const fn = new Function(q.solution + `\n;return ${q.fnName};`)(); q.tests.forEach((t, i) => { const got = fn(...t.args); if (JSON.stringify(got) !== JSON.stringify(t.expect)) err(w, `reference solution fails test ${i}: got ${JSON.stringify(got)}`); }); } catch (e) { err(w, 'solution error: ' + e.message); }
      }
    }
  }
  const pids = new Set();
  for (const p of m.projects || []) {
    const w = p.id || '(project)';
    if (!str(p.id) || pids.has(p.id) || seenIds.has(p.id)) err(w, 'project id missing/duplicate'); pids.add(p.id); seenIds.add(p.id);
    for (const k of ['title', 'objective', 'est']) if (!str(p[k])) err(w, k);
    if (!['text', 'code'].includes(p.kind)) err(w, 'kind text|code');
    for (const k of ['requirements', 'hints', 'success', 'rubric', 'extensions']) if (!arr(p[k]) || !p[k].length) err(w, `${k} needs entries`);
    if (!arr(p.guidance) || p.guidance.length < 3) err(w, 'guidance ≥3 steps');
    (p.skills || []).forEach((s) => allSkills.has(s) || err(w, `unknown skill ${s}`));
    if (p.kind === 'text' && (!arr(p.checks) || p.checks.length < 2)) err(w, 'text projects need ≥2 automated checks');
    (p.checks || []).forEach((c) => { if (!str(c.id) || !str(c.label) || !str(c.hint) || !['regex', 'minWords', 'maxWords', 'sections'].includes(c.type)) err(w, `check ${c.id} malformed`); if (c.type === 'regex') try { new RegExp(c.pattern, c.flags || 'i'); } catch { err(w, `check ${c.id} bad regex`); } });
    if (p.kind === 'code') { if (!str(p.fnName) || !str(p.starter) || !arr(p.tests) || p.tests.length < 3) err(w, 'code project needs fnName/starter/≥3 tests'); }
  }
}
// ── Cross-cutting quality rules ───────────────────────────────────────────────
// (1) The correct MCQ option must not be predictably the longest (learners spot this and stop thinking).
// (2) Every skill needs enough questions to be able to reach Strong (needs weighted evidence ≥ 3 over ≥ 2 days).
const qPerSkill = new Map();
for (const f of readdirSync(dir).filter((x) => /^l\d\.js$/.test(x))) {
  let m; try { m = (await import(pathToFileURL(path.join(dir, f)).href)).default; } catch { continue; }
  for (const L of m.lessons || []) for (const q of L.quiz || []) qPerSkill.set(q.skill, (qPerSkill.get(q.skill) || 0) + 1);
}
for (const [f, m] of mods) {
  const mcq = (m.lessons || []).flatMap((L) => L.quiz || []).filter((q) => q.type === 'mcq' && q.options?.length >= 3);
  const longest = mcq.filter((q) => { const lens = q.options.map((o) => o.length); const mx = Math.max(...lens); return lens[q.answer] === mx && lens.filter((l) => l === mx).length === 1; }).length;
  const share = mcq.length ? longest / mcq.length : 0;
  if (mcq.length >= 8 && share > 0.45) err(f, `correct option is the strict longest in ${Math.round(share * 100)}% of ${mcq.length} MCQs (limit 45%): rebalance distractor length/detail`);
  const thin = (m.skills || []).filter((s) => (qPerSkill.get(s.id) || 0) < 4);
  if (thin.length) err(f, `skills with <4 questions (cannot realistically reach Strong): ${thin.map((s) => `${s.id}(${qPerSkill.get(s.id) || 0})`).join(', ')}`);
}
console.log(`\n${errors} error(s), ${warns} warning(s)`);
process.exit(errors ? 1 : 0);
