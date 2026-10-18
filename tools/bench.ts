// Đo thời gian một lời giải theo bậc thang quy mô và ước lượng số mũ (Big-O thực nghiệm).
//   node tools/bench.ts lessons/F04-hashing 03                    đo bài làm (ngôn ngữ như check)
//   node tools/bench.ts lessons/F04-hashing 03 --lang java        chọn ngôn ngữ
//   node tools/bench.ts lessons/F04-hashing 03 --src solutions    đo lời giải mẫu (TS)
//   node tools/bench.ts lessons/F04-hashing 03 --file x.ts --fn twoSum   đo một hàm TS bất kỳ (dùng gen của bài)
//   tùy chọn: --scales xs,s,m,l,xl  --runs 5  --name <tên>  --max-sec 30
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Rng } from './lib.ts';
import { SCALES, execute, invoke, nameOf, prepare, type ScaleName, type Spec } from './spec.ts';
import { prepareRunner, writeInput, type ExtLang } from './extern.ts';
import { defaultLang, type Lang } from './config.ts';

const argv = process.argv.slice(2);
const opt = (name: string, def: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : def;
};
const positional = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
const [lessonDir, nnRaw] = positional;
if (!lessonDir || !nnRaw) {
  console.log('Dùng: node tools/bench.ts <lessons/ID-slug> <NN> [--lang ts|py|java] [--src solutions] [--file f.ts --fn name] [--scales s,m,l] [--runs 5]');
  process.exit(2);
}
const nn = nnRaw.padStart(2, '0');
const src = opt('--src', 'answers');
const scales = opt('--scales', 's,m,l').split(',') as ScaleName[];
const runs = Number(opt('--runs', '5'));
const maxMs = Number(opt('--max-sec', '30')) * 1000;

const specs: Record<string, Spec> = (await import(pathToFileURL(resolve(lessonDir, 'checks.ts')).href)).specs;
const spec = specs[nn];
if (!spec?.gen) {
  console.log(`ex${nn} không có gen nên không bench được.`);
  process.exit(2);
}

// ───────────── chọn implementation ─────────────
let lang: Lang = 'ts';
let impl: any = null;
let label: string;
let extFile = '';
const file = opt('--file', '');
if (file) {
  impl = (await import(pathToFileURL(resolve(file)).href))[opt('--fn', nameOf(spec))];
  label = basename(file);
} else if (src === 'solutions') {
  impl = spec.ref;
  label = 'solutions';
} else {
  const forced = opt('--lang', '') as Lang | '';
  const found = (['ts', 'py', 'java'] as Lang[])
    .map((l) => ({ l, f: join(lessonDir, 'answers', `ex${nn}.${l}`) }))
    .filter((x) => existsSync(x.f) && (!forced || x.l === forced))
    .sort((a, b) => statSync(b.f).mtimeMs - statSync(a.f).mtimeMs);
  if (!found.length) {
    console.log(`Chưa có answers/ex${nn}.${forced || defaultLang()}`);
    process.exit(2);
  }
  lang = found[0].l;
  label = `answers-${lang}`;
  if (lang === 'ts') impl = (await import(pathToFileURL(resolve(found[0].f)).href))[nameOf(spec)];
  else extFile = resolve(found[0].f);
}
if (lang === 'ts' && !impl) {
  console.log(`Không tìm thấy export \`${opt('--fn', nameOf(spec))}\``);
  process.exit(2);
}

// ───────────── đo 1 scale ─────────────
type Measure = { ms: number; heap: number; note: string } | { error: string };

function measureTs(args: any[], n: number): Measure {
  for (let k = 0; k < 3; k++) invoke(spec, impl, spec.gen!(Math.min(n, 200), new Rng(100 + k)));
  const times: number[] = [];
  let heap = 0;
  for (let k = 0; k < runs; k++) {
    const p = prepare(spec, args);
    const h0 = process.memoryUsage().heapUsed;
    const t0 = performance.now();
    try {
      execute(spec, impl, p);
    } catch (e) {
      return { error: e instanceof RangeError ? 'stack overflow' : `lỗi: ${(e as Error).message}` };
    }
    const dt = performance.now() - t0;
    heap = Math.max(heap, process.memoryUsage().heapUsed - h0);
    times.push(dt);
    if (dt * (runs - k - 1) > maxMs) break;
  }
  times.sort((a, b) => a - b);
  return { ms: times[Math.floor((times.length - 1) / 2)], heap, note: times.length < runs ? `chỉ đo ${times.length} lần` : '' };
}

async function measureExt(args: any[], n: number, timeoutMs: number): Promise<Measure> {
  const runner = prepareRunner(lang as ExtLang, extFile);
  if ('error' in runner) return { error: runner.error };
  // vài input nhỏ chạy trước để JIT (Java) khởi động
  const warm = [0, 1, 2].map((k) => ({ args: spec.gen!(Math.min(n, 200), new Rng(100 + k)) }));
  const input = writeInput(spec, [...warm, { args, time: true, repeat: runs }]);
  const child = spawn(runner.cmd, runner.args(input.file), { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  const timer = setTimeout(() => child.kill(), timeoutMs);
  let result: Measure = { error: 'runner không trả kết quả' };
  for await (const raw of createInterface({ input: child.stdout })) {
    let line: any;
    try {
      line = JSON.parse(raw);
    } catch {
      continue;
    }
    if (line.fatal) result = { error: line.fatal };
    else if (line.ok === false) result = { error: String(line.err).split('\n')[0] };
    else if (line.i === warm.length) result = { ms: line.ms, heap: 0, note: '' };
  }
  clearTimeout(timer);
  if (child.killed) result = { error: `quá ${timeoutMs / 1000}s — đã dừng` };
  runner.cleanup();
  rmSync(input.dir, { recursive: true, force: true });
  return result;
}

const fmtN = (n: number) => (n >= 1000 && /^10*$/.test(String(n)) ? `1e${String(n).length - 1}` : n.toLocaleString('en'));
const rows: string[] = [];
let prev: { n: number; ms: number; exp: number | null } | null = null;
for (const sc of scales) {
  const n = spec.benchScales?.[sc] ?? SCALES[sc];
  if (prev && prev.ms > 0.05) {
    const predicted = prev.ms * Math.pow(n / prev.n, Math.max(prev.exp ?? 1, 1));
    if (predicted * Math.min(runs, 3) > maxMs) {
      rows.push(`| ${sc} | ${fmtN(n)} | – | – | – | – | bỏ qua: dự đoán ~${(predicted / 1000).toFixed(0)} s/lần |`);
      continue;
    }
  }
  const args = spec.gen(n, new Rng(7));
  const m = lang === 'ts' ? measureTs(args, n) : await measureExt(args, n, maxMs * 2 + 20_000);
  if ('error' in m) {
    rows.push(`| ${sc} | ${fmtN(n)} | – | – | – | – | ${m.error} |`);
    continue;
  }
  let ratio = '–';
  let exp: number | null = null;
  if (prev && prev.ms > 0.05) {
    ratio = `×${(m.ms / prev.ms).toFixed(1)}`;
    exp = Math.log(m.ms / prev.ms) / Math.log(n / prev.n);
  }
  const heap = lang === 'ts' ? (m.heap > 0 ? (m.heap / 1e6).toFixed(1) : '~0') : 'n/a';
  rows.push(`| ${sc} | ${fmtN(n)} | ${m.ms < 1 ? m.ms.toFixed(3) : m.ms.toFixed(1)} | ${ratio} | ${exp === null ? '–' : exp.toFixed(2)} | ${heap} | ${m.note} |`);
  prev = { n, ms: m.ms, exp };
}

const title = `${basename(lessonDir)} · ex${nn} · ${spec.title} · ${label}`;
const env = lang === 'ts' ? `Node ${process.version}` : lang === 'py' ? 'Python' : 'Java';
const table = [
  `## ${title}`,
  '',
  `${env} · ${runs} lần/scale, lấy median · số mũ = log(t₂/t₁) / log(n₂/n₁) (≈1: O(n), ≈1.1: O(n log n), ≈2: O(n²))`,
  '',
  '| scale | n | median ms | ×thời gian | số mũ | heap MB (≈) | ghi chú |',
  '|---|---|---|---|---|---|---|',
  ...rows,
].join('\n');
console.log(table);

const date = new Date().toISOString().slice(0, 10);
const name = opt('--name', `${basename(lessonDir).split('-')[0]}-ex${nn}-${label.replace(/\.ts$/, '')}`);
const outDir = resolve(import.meta.dirname, '..', 'bench', 'results');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${date}-${name}.md`);
writeFileSync(out, table + '\n');
console.log(`\n→ đã lưu ${out}`);
