// Chạy bài làm Python / Java qua runner ngoài (JSON in → JSON lines out).
import { EventEmitter } from 'node:events';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { createInterface } from 'node:readline';
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { preview } from './lib.ts';
import { sigForRunner } from './sig.ts';
import { applyOutput, compareOutput, invoke, needArgs, perfLimit, type Spec } from './spec.ts';
import { buildPlan } from './plan.ts';

export type ExtLang = 'py' | 'java';
const ROOT = resolve(import.meta.dirname, '..');
const PY_RUNNER = join(ROOT, 'tools', 'runners', 'py', 'run.py');
const JAVA_SRC = join(ROOT, 'tools', 'runners', 'java');
const JAVA_OUT = join(JAVA_SRC, 'out');

// ───────────── tìm Java ─────────────
let javaBin: string | null | undefined;
export function findJavaBin(): string | null {
  if (javaBin !== undefined) return javaBin;
  const exe = process.platform === 'win32' ? '.exe' : '';
  const candidates: string[] = [];
  if (process.env.JAVA_HOME) candidates.push(join(process.env.JAVA_HOME, 'bin'));
  for (const p of (process.env.PATH ?? '').split(delimiter)) candidates.push(p);
  for (const base of ['C:\\Program Files\\Eclipse Adoptium', 'C:\\Program Files\\Java', 'C:\\Program Files\\Microsoft']) {
    if (existsSync(base)) for (const d of readdirSync(base).sort().reverse()) candidates.push(join(base, d, 'bin'));
  }
  javaBin = candidates.find((d) => d && existsSync(join(d, `javac${exe}`)) && existsSync(join(d, `java${exe}`))) ?? null;
  return javaBin;
}
const javaExe = (tool: 'java' | 'javac') => join(findJavaBin()!, tool + (process.platform === 'win32' ? '.exe' : ''));

function ensureJavaLib(): string | null {
  const sources = readdirSync(JAVA_SRC).filter((f) => f.endsWith('.java'));
  const marker = join(JAVA_OUT, 'Runner.class');
  const newest = Math.max(...sources.map((f) => statSync(join(JAVA_SRC, f)).mtimeMs));
  if (existsSync(marker) && statSync(marker).mtimeMs >= newest) return null;
  const r = spawnSync(javaExe('javac'), ['-encoding', 'UTF-8', '-nowarn', '-d', JAVA_OUT, ...sources.map((f) => join(JAVA_SRC, f))], { encoding: 'utf8' });
  return r.status === 0 ? null : `Không biên dịch được runner Java:\n${r.stderr}`;
}

/** Chuẩn bị lệnh chạy runner cho 1 file bài làm. Trả về lỗi (biên dịch...) nếu có. */
export function prepareRunner(lang: ExtLang, answer: string): { cmd: string; args: (input: string) => string[]; cleanup: () => void } | { error: string } {
  if (lang === 'py') {
    return { cmd: process.env.PYTHON ?? 'python', args: (input) => ['-X', 'utf8', PY_RUNNER, answer, input], cleanup: () => {} };
  }
  if (!findJavaBin()) return { error: 'Không tìm thấy JDK (javac). Cài: winget install EclipseAdoptium.Temurin.21.JDK rồi mở terminal mới.' };
  const libErr = ensureJavaLib();
  if (libErr) return { error: libErr };
  const outDir = mkdtempSync(join(tmpdir(), 'dsa-java-'));
  const r = spawnSync(javaExe('javac'), ['-encoding', 'UTF-8', '-nowarn', '-cp', JAVA_OUT, '-d', outDir, answer], { encoding: 'utf8' });
  if (r.status !== 0) {
    rmSync(outDir, { recursive: true, force: true });
    const msg = (r.stderr || r.stdout).split('\n').slice(0, 20).join('\n');
    return { error: `Lỗi biên dịch:\n${msg}` };
  }
  return {
    cmd: javaExe('java'),
    args: (input) => ['-Dstdout.encoding=UTF-8', '-Dfile.encoding=UTF-8', '-cp', [outDir, JAVA_OUT].join(delimiter), 'Runner', input],
    cleanup: () => rmSync(outDir, { recursive: true, force: true }),
  };
}

export function writeInput(spec: Spec, tests: { args: any[]; time?: boolean; repeat?: number }[]): { file: string; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), 'dsa-in-'));
  const file = join(dir, 'input.json');
  writeFileSync(file, JSON.stringify({ sig: sigForRunner(spec.sig), needArgs: needArgs(spec), tests }));
  return { file, dir };
}

/** Kết quả 1 dòng từ runner → output JSON thuần theo quy tắc output của spec. */
export function lineOutput(spec: Spec, line: any): any {
  return spec.sig.trimStart().startsWith('class') ? line.ret : applyOutput(spec, line.ret, line.args);
}

/**
 * Chấm 1 bài Python/Java. Phát ra cùng loại message như worker TS (cases, stress, perf-start, perf, fail, todo, fatal, done)
 * để tools/check.ts xử lý giống nhau.
 */
export class ExternalJob extends EventEmitter {
  private child: ChildProcess | null = null;
  private dead = false;
  private cleanups: (() => void)[] = [];

  private lessonDir: string;
  private nn: string;
  private lang: ExtLang;

  constructor(lessonDir: string, nn: string, lang: ExtLang) {
    super();
    this.lessonDir = lessonDir;
    this.nn = nn;
    this.lang = lang;
    setImmediate(() => this.start().catch((e) => this.post({ type: 'fatal', msg: String(e?.stack ?? e) })));
  }

  private post(m: Record<string, unknown>) {
    if (!this.dead) this.emit('message', m);
  }

  terminate() {
    this.dead = true;
    this.child?.kill();
    for (const c of this.cleanups) c();
    this.cleanups = [];
    return Promise.resolve(0);
  }

  private async start() {
    const specs: Record<string, Spec> = (await import(pathToFileURL(resolve(this.lessonDir, 'checks.ts')).href)).specs;
    const spec = specs[this.nn];
    if (!spec) return this.post({ type: 'fatal', msg: `Không có bài ex${this.nn} trong checks.ts` });
    const answer = resolve(this.lessonDir, 'answers', `ex${this.nn}.${this.lang}`);
    if (!existsSync(answer)) return this.post({ type: 'todo', msg: `chưa có ${answer} (chạy: node tools/scaffold.ts ${this.lessonDir} --lang ${this.lang})` });

    const plan = buildPlan(spec, spec.ref, 'ref');
    const tests: { args: any[]; time?: boolean; repeat?: number }[] = plan.tests.map((t) => ({ args: t.args }));
    const perfIndex = plan.perf ? tests.push({ args: plan.perf.args, time: true, repeat: 3 }) - 1 : -1;

    const runner = prepareRunner(this.lang, answer);
    if ('error' in runner) return this.post({ type: 'fatal', msg: runner.error });
    const input = writeInput(spec, tests);
    this.cleanups.push(runner.cleanup, () => rmSync(input.dir, { recursive: true, force: true }));
    if (this.dead) return;

    const child = spawn(runner.cmd, runner.args(input.file), { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
    this.child = child;
    const closed = new Promise((r) => child.once('close', r));
    let stderr = '';
    child.stderr.on('data', (d) => (stderr += d));
    const rl = createInterface({ input: child.stdout });

    let casesPosted = false;
    const postCases = () => {
      if (!casesPosted) this.post({ type: 'cases', passed: plan.nCases, total: plan.nCases, selfOnly: plan.selfOnly });
      casesPosted = true;
    };
    let stressPosted = false;
    const postStressAndPerfStart = () => {
      if (stressPosted) return;
      stressPosted = true;
      postCases();
      this.post({ type: 'stress', ...plan.stress, ...('skipped' in plan.stress ? { skipped: true, reason: plan.stress.skipped } : {}) });
      if (plan.perf && spec.perf) this.post({ type: 'perf-start', n: plan.perf.n, limitMs: perfLimit(spec.perf, this.lang) });
    };
    if (plan.tests.length === 0) postStressAndPerfStart();

    let finished = false;
    let gotDone = false;
    const end = (m: Record<string, unknown>) => {
      if (finished) return;
      finished = true;
      this.post(m);
      void this.terminate();
    };

    for await (const raw of rl) {
      if (finished) break;
      let line: any;
      try {
        line = JSON.parse(raw);
      } catch {
        continue; // print() của người học → bỏ qua
      }
      if (line.fatal) return end({ type: 'fatal', msg: line.fatal });
      if (line.done) {
        gotDone = true;
        break;
      }
      const i: number = line.i;
      const isPerf = i === perfIndex;
      const t = plan.tests[i];
      if (!line.ok) {
        if (line.todo) return end({ type: 'todo', msg: 'bài làm còn để trống' });
        if (isPerf) return end({ type: 'fail', phase: 'perf', n: plan.perf!.n, error: line.err });
        return end({ type: 'fail', phase: t.phase, n: t.n, input: preview(t.args, 400), error: line.err, note: t.note });
      }
      if (isPerf) {
        const limitMs = perfLimit(spec.perf as any, this.lang);
        if (line.ms > limitMs) return end({ type: 'fail', phase: 'perf', n: plan.perf!.n, ms: line.ms, limitMs });
        const got = lineOutput(spec, line);
        const expected = invoke(spec, spec.ref, plan.perf!.args);
        const ok = compareOutput(spec, got, expected, plan.perf!.args);
        if (ok !== true) return end({ type: 'fail', phase: 'perf', n: plan.perf!.n, wrongAtScale: true, got: preview(got, 200), expected: preview(expected, 200), why: ok });
        this.post({ type: 'perf', n: plan.perf!.n, ms: line.ms, limitMs });
        continue;
      }
      if (t.phase === 'stress') postCases();
      if (t.expected !== undefined) {
        const got = lineOutput(spec, line);
        const ok = compareOutput(spec, got, t.expected, t.args);
        if (ok !== true) return end({ type: 'fail', phase: t.phase, n: t.n, input: preview(t.args, 400), got: preview(got, 400), expected: preview(t.expected, 400), why: ok, note: t.note });
      }
      if (i === plan.tests.length - 1) postStressAndPerfStart();
    }
    if (finished) return;
    await closed;
    if (finished || this.dead) return;
    if (!gotDone) return end({ type: 'fatal', msg: `runner dừng bất thường (exit ${child.exitCode})\n${stderr.split('\n').slice(-15).join('\n')}` });
    postStressAndPerfStart();
    if (!plan.perf) this.post({ type: 'perf', skipped: true });
    if (child.exitCode && child.exitCode !== 0 && stderr) return end({ type: 'fatal', msg: stderr.split('\n').slice(-15).join('\n') });
    end({ type: 'done' });
  }
}
