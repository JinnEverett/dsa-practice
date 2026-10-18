// Chấm bài (TypeScript / Python / Java).
//   node tools/check.ts lessons/F04-hashing 03                chấm 1 bài
//   node tools/check.ts lessons/F04-hashing                   chấm mọi bài của module
//   node tools/check.ts lessons/F04-hashing 03 --lang py      chọn ngôn ngữ (mặc định: file exNN.* sửa gần nhất)
//   node tools/check.ts lessons/F04-hashing 03 --src solutions   chạy lời giải mẫu (TS)
//   node tools/check.ts --all --src solutions --quiet         kiểm chứng toàn bộ lời giải mẫu
import { Worker } from 'node:worker_threads';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { nameOf, type Spec } from './spec.ts';
import { ExternalJob } from './extern.ts';
import { defaultLang, type Lang } from './config.ts';

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const opt = (name: string, def: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : def;
};
const src = opt('--src', 'answers') as 'answers' | 'solutions';
const forcedLang = opt('--lang', '') as Lang | '';
const quiet = flag('--quiet');
const VALUE_FLAGS = ['--src', '--timeout', '--lang'];
const positional = argv.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(argv[i - 1]));

const ROOT = resolve(import.meta.dirname, '..');
const fmtN = (n: number) => (n >= 1000 && /^10*$/.test(String(n)) ? `1e${String(n).length - 1}` : n.toLocaleString('en'));
const LANG_NAME: Record<Lang, string> = { ts: 'TS', py: 'Python', java: 'Java' };

/** Ngôn ngữ của bài: --lang > file exNN.* sửa gần nhất > mặc định trong dsa.config.json. */
export function pickLang(lessonDir: string, nn: string): Lang {
  if (src === 'solutions') return 'ts';
  if (forcedLang) return forcedLang;
  const found = (['ts', 'py', 'java'] as Lang[])
    .map((l) => ({ l, f: join(lessonDir, 'answers', `ex${nn}.${l}`) }))
    .filter((x) => existsSync(x.f))
    .sort((a, b) => statSync(b.f).mtimeMs - statSync(a.f).mtimeMs);
  return found[0]?.l ?? defaultLang();
}

type Result = { status: 'pass' | 'fail' | 'todo'; line: string; detail: string[] };

function runOne(lessonDir: string, nn: string, title: string, lang: Lang): Promise<Result> {
  const caseTimeoutMs = Number(opt('--timeout', lang === 'ts' ? '30000' : '60000'));
  return new Promise((done) => {
    const w: { on: (ev: string, fn: (x: any) => void) => unknown; terminate: () => Promise<number> } =
      lang === 'ts' ? new Worker(new URL('./worker.ts', import.meta.url), { workerData: { lessonDir, nn, src } }) : new ExternalJob(lessonDir, nn, lang);
    const detail: string[] = [];
    const summary: string[] = [];
    let finished = false;
    let timer = setTimeout(() => kill(`⏱ quá ${caseTimeoutMs / 1000}s ở phần cases/stress — có thể lặp vô hạn`), caseTimeoutMs);
    const finish = (status: Result['status']) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      void w.terminate();
      const mark = status === 'pass' ? '✅' : status === 'todo' ? '⬜' : '❌';
      detail.push(`Kết quả  : ${status === 'pass' ? '✅ ĐÚNG' : status === 'todo' ? '⬜ CHƯA LÀM' : '❌ SAI'}`);
      done({ status, line: `${mark} ex${nn} · ${title} [${LANG_NAME[lang]}]  ${summary.join(' · ')}`, detail });
    };
    const kill = (msg: string) => {
      detail.push(`Lỗi      : ${msg}`);
      finish('fail');
    };
    w.on('message', (m: any) => {
      switch (m.type) {
        case 'todo':
          detail.push(`Trạng thái: ${m.msg}`);
          return finish('todo');
        case 'fatal':
          detail.push(`Lỗi      : ${m.msg}`);
          return finish('fail');
        case 'cases':
          detail.push(`Cases    : ✅ ${m.passed}/${m.total}${m.selfOnly ? ` (${m.selfOnly} case không có đáp án độc lập)` : ''}`);
          summary.push(`cases ${m.passed}/${m.total}`);
          return;
        case 'stress':
          if (m.skipped) detail.push(`Stress   : – bỏ qua (${m.reason})`);
          else {
            detail.push(`Stress   : ✅ ${m.runs}/${m.runs} (seed 42, n ≤ ${m.maxN}, so với ${m.against})`);
            summary.push(`stress ${m.runs}`);
          }
          return;
        case 'perf-start':
          clearTimeout(timer);
          timer = setTimeout(() => {
            detail.push(`Perf     : ❌ n=${fmtN(m.n)} chạy quá ${m.limitMs * 3} ms (giới hạn ${m.limitMs} ms) — đã dừng`);
            summary.push('perf ⏱');
            finish('fail');
          }, m.limitMs * 3 + 5000);
          return;
        case 'perf':
          if (m.skipped) detail.push('Perf     : – không đo');
          else {
            detail.push(`Perf     : ✅ n=${fmtN(m.n)} · ${m.ms.toFixed(1)} ms (giới hạn ${m.limitMs} ms)`);
            summary.push(`perf ${m.ms.toFixed(0)}/${m.limitMs}ms`);
          }
          return;
        case 'done':
          return finish('pass');
        case 'fail': {
          const where = { cases: 'Cases    ', stress: 'Stress   ', perf: 'Perf     ' }[m.phase as 'cases'] ?? m.phase;
          if (m.phase === 'perf' && m.ms !== undefined) {
            detail.push(`${where}: ❌ n=${fmtN(m.n)} · ${m.ms.toFixed(0)} ms > giới hạn ${m.limitMs} ms`);
          } else if (m.phase === 'perf' && m.wrongAtScale) {
            detail.push(`${where}: ❌ đúng ở n nhỏ nhưng SAI ở n=${fmtN(m.n)} (tràn số? giới hạn mảng?)`);
          } else if (m.phase === 'perf') {
            detail.push(`${where}: ❌ lỗi khi chạy n=${fmtN(m.n)}`);
          } else {
            detail.push(`${where}: ❌ ${m.phase === 'stress' ? `phản ví dụ (n=${m.n})` : 'sai ở case cố định'}${m.note ? ` — ${m.note}` : ''}`);
          }
          if (m.input) detail.push(`  input   : ${m.input}`);
          if (m.error) detail.push(`  lỗi     : ${m.error}`);
          if (m.got !== undefined) detail.push(`  bài làm : ${m.got}`);
          if (m.expected !== undefined) detail.push(`  kỳ vọng : ${m.expected}`);
          if (m.why && m.why !== 'sai kết quả') detail.push(`  lý do   : ${m.why}`);
          summary.push(`${m.phase} ❌`);
          return finish('fail');
        }
      }
    });
    w.on('error', (e: any) => kill(e?.stack ?? String(e)));
    w.on('exit', () => kill('worker dừng bất thường'));
  });
}

async function checkLesson(lessonDir: string, only: string[]) {
  const checksFile = join(lessonDir, 'checks.ts');
  const tally = { pass: 0, fail: 0, todo: 0, failed: [] as string[] };
  if (!existsSync(checksFile)) return tally;
  const specs: Record<string, Spec> = (await import(pathToFileURL(resolve(checksFile)).href)).specs;
  const ids = only.length ? only.map((x) => x.padStart(2, '0')) : Object.keys(specs).filter((k) => !specs[k].benchOnly).sort();
  const name = basename(lessonDir);
  if (!quiet) console.log(`\n### ${name}${src === 'solutions' ? '  (lời giải mẫu)' : ''}`);
  for (const nn of ids) {
    const spec = specs[nn];
    const title = spec ? `${spec.title} (${nameOf(spec)})` : '?';
    const lang = pickLang(lessonDir, nn);
    const r = await runOne(lessonDir, nn, title, lang);
    tally[r.status]++;
    if (r.status === 'fail') tally.failed.push(`${name}/ex${nn}`);
    if (quiet) {
      if (r.status !== 'pass') console.log(`${name} ${r.line}\n  ${r.detail.join('\n  ')}`);
    } else {
      console.log(`== ex${nn} · ${title} · ${LANG_NAME[lang]}`);
      console.log(r.detail.join('\n'));
    }
  }
  if (quiet) console.log(`${tally.fail ? '❌' : '✅'} ${name}: ${tally.pass} đúng · ${tally.fail} sai · ${tally.todo} chưa làm`);
  return tally;
}

async function main() {
  let lessons: string[];
  let only: string[] = [];
  if (flag('--all')) {
    const dir = join(ROOT, 'lessons');
    lessons = readdirSync(dir)
      .filter((d) => existsSync(join(dir, d, 'checks.ts')))
      .filter((d) => positional.length === 0 || positional.some((p) => d.startsWith(p)))
      .sort()
      .map((d) => join('lessons', d));
  } else {
    if (!positional[0]) {
      console.log('Dùng: node tools/check.ts <lessons/ID-slug> [NN...] [--lang ts|py|java] [--src answers|solutions] [--quiet]');
      process.exit(2);
    }
    lessons = [positional[0].replace(/[\\/]+$/, '')];
    only = positional.slice(1);
  }
  const total = { pass: 0, fail: 0, todo: 0, failed: [] as string[] };
  for (const l of lessons) {
    const t = await checkLesson(l, only);
    total.pass += t.pass;
    total.fail += t.fail;
    total.todo += t.todo;
    total.failed.push(...t.failed);
  }
  if (lessons.length > 1 || flag('--all')) {
    console.log(`\nTổng: ${total.pass} đúng · ${total.fail} sai · ${total.todo} chưa làm`);
    if (total.failed.length) console.log(`Sai: ${total.failed.join(', ')}`);
  }
  process.exit(total.fail ? 1 : 0);
}

if (import.meta.main) await main();
