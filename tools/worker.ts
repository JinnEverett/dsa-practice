// Chấm MỘT bài TypeScript trong worker thread để có thể dừng khi lặp vô hạn / quá giờ.
// Được gọi từ tools/check.ts — không chạy trực tiếp.
import { parentPort, workerData } from 'node:worker_threads';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Rng, preview } from './lib.ts';
import { compareOutput, execute, finish, invoke, nameOf, perfFactor, prepare, type Spec } from './spec.ts';
import { buildPlan } from './plan.ts';

const { lessonDir, nn, src } = workerData as { lessonDir: string; nn: string; src: 'answers' | 'solutions' };
const post = (m: Record<string, unknown>) => parentPort!.postMessage(m);
const TODO = 'Chưa làm';

export function errText(e: unknown): string {
  if (e instanceof RangeError && /call stack/i.test(e.message)) return 'RangeError: Maximum call stack size exceeded (đệ quy quá sâu)';
  if (e instanceof Error) {
    const where = (e.stack ?? '').split('\n').find((l) => /answers|solutions/.test(l))?.trim();
    return `${e.name}: ${e.message}${where ? `\n           ${where}` : ''}`;
  }
  return String(e);
}

async function main() {
  const specs: Record<string, Spec> = (await import(pathToFileURL(resolve(lessonDir, 'checks.ts')).href)).specs;
  const spec = specs[nn];
  if (!spec) return post({ type: 'fatal', msg: `Không có bài ex${nn} trong checks.ts` });
  const name = nameOf(spec);

  let impl: any;
  if (src === 'solutions') {
    impl = spec.ref;
  } else {
    const file = join(lessonDir, 'answers', `ex${nn}.ts`);
    if (!existsSync(file)) return post({ type: 'todo', msg: `chưa có ${file} (chạy: node tools/scaffold.ts ${lessonDir})` });
    impl = (await import(pathToFileURL(resolve(file)).href))[name];
    if (impl === undefined) return post({ type: 'fatal', msg: `answers/ex${nn}.ts chưa export \`${name}\`` });
  }
  const verifying = src === 'solutions';
  const plan = verifying ? buildPlan(spec, spec.brute, 'brute') : buildPlan(spec, spec.ref, 'ref');

  let casesDone = false;
  for (const t of plan.tests) {
    if (t.phase === 'stress' && !casesDone) {
      post({ type: 'cases', passed: plan.nCases, total: plan.nCases, selfOnly: plan.selfOnly });
      casesDone = true;
    }
    let got: any;
    try {
      got = invoke(spec, impl, t.args);
    } catch (e) {
      if (e instanceof Error && e.message.includes(TODO)) return post({ type: 'todo', msg: 'bài làm còn để trống' });
      return post({ type: 'fail', phase: t.phase, n: t.n, input: preview(t.args, 400), error: errText(e), note: t.note });
    }
    if (t.expected === undefined) continue;
    const ok = compareOutput(spec, got, t.expected, t.args);
    if (ok !== true) {
      return post({ type: 'fail', phase: t.phase, n: t.n, input: preview(t.args, 400), got: preview(got, 400), expected: preview(t.expected, 400), why: ok, note: t.note });
    }
  }
  if (!casesDone) post({ type: 'cases', passed: plan.nCases, total: plan.nCases, selfOnly: plan.selfOnly });
  post({ type: 'stress', ...plan.stress, ...('skipped' in plan.stress ? { skipped: true, reason: plan.stress.skipped } : {}) });

  if (plan.perf && spec.perf) {
    const { n, args } = plan.perf;
    const limitMs = spec.perf.limitMs * perfFactor();
    for (let k = 0; k < 3; k++) invoke(spec, impl, spec.gen!(Math.min(n, 200), new Rng(100 + k))); // warm-up JIT
    post({ type: 'perf-start', n, limitMs });
    const times: number[] = [];
    let last: any;
    for (let k = 0; k < 3; k++) {
      const p = prepare(spec, args);
      let ret: any;
      const t0 = performance.now();
      try {
        ret = execute(spec, impl, p);
      } catch (e) {
        return post({ type: 'fail', phase: 'perf', n, error: errText(e) });
      }
      const dt = performance.now() - t0;
      times.push(dt);
      last = finish(spec, ret, p);
      if (dt > limitMs) break;
    }
    times.sort((a, b) => a - b);
    const ms = times[Math.floor((times.length - 1) / 2)];
    if (ms > limitMs) return post({ type: 'fail', phase: 'perf', n, ms, limitMs });
    if (!verifying) {
      const expected = invoke(spec, spec.ref, args);
      const ok = compareOutput(spec, last, expected, args);
      if (ok !== true) return post({ type: 'fail', phase: 'perf', n, wrongAtScale: true, got: preview(last, 200), expected: preview(expected, 200), why: ok });
    }
    post({ type: 'perf', n, ms, limitMs });
  } else {
    post({ type: 'perf', skipped: true });
  }
  post({ type: 'done' });
}

main().catch((e) => post({ type: 'fatal', msg: errText(e) }));
