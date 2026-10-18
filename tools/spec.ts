// Spec chấm bài + cách gọi một lời giải TS theo spec. Dùng chung cho check, bench và runner Python/Java.
import { Rng, canonical, deepEqual, floatEqual } from './lib.ts';
import { fromPlain, parseSig, toPlain, type Sig } from './sig.ts';

export type CompareFn = (got: any, expected: any, args: any[]) => boolean | string;
export type Compare = 'exact' | 'unordered' | 'unordered-deep' | 'float' | CompareFn;

export interface Case {
  /** Input thô dạng JSON: mảng cho ListNode/TreeNode, {vals, pos} cho list có chu trình. */
  args: any[];
  /** Kết quả kỳ vọng viết tay (JSON thuần). Không có thì lấy từ brute (hoặc ref). */
  expected?: any;
  note?: string;
}

export interface Perf {
  n: number;
  /** Giới hạn cho TS. */
  limitMs: number;
  /** Giới hạn riêng cho Python / Java (mặc định ×10 / ×3 của limitMs). */
  py?: number;
  java?: number;
}

export interface Spec {
  /** Chữ ký kiểu Java, vd. 'int countPairs(int[] nums, int k)' hoặc khung 'class X { ... }' (xem tools/sig.ts). */
  sig: string;
  /** Tiêu đề ngắn của bài. */
  title: string;
  /** Lời giải tham chiếu (best practice) — import từ solutions.ts. */
  ref: any;
  /** Lời giải ngây thơ nhưng chắc chắn đúng, dùng để kiểm chứng ref bằng stress test. */
  brute?: any;
  cases: Case[];
  /** Sinh input thô ngẫu nhiên kích thước n. Class: trả về [ops, opArgs]. */
  gen?: (n: number, r: Rng) => any[];
  /** Lấy gì để so: 'return' (mặc định), 'arg0' (bài sửa tại chỗ) hoặc hàm (ret, args) trên dữ liệu JSON thuần. */
  output?: 'return' | 'arg0' | ((ret: any, args: any[]) => any);
  compare?: Compare;
  stress?: { runs?: number; minN?: number; maxN?: number } | false;
  perf?: Perf | false;
  /** Ghi đè n của từng scale khi bench. */
  benchScales?: Partial<Record<ScaleName, number>>;
  /** Bài chỉ để đo bằng bench (check và scaffold bỏ qua). */
  benchOnly?: boolean;
}

export type ScaleName = 'xs' | 's' | 'm' | 'l' | 'xl';
export const SCALES: Record<ScaleName, number> = { xs: 10, s: 1_000, m: 100_000, l: 1_000_000, xl: 10_000_000 };

export const sigOf = (spec: Spec): Sig => parseSig(spec.sig);
export const nameOf = (spec: Spec): string => parseSig(spec.sig).name;
export const needArgs = (spec: Spec): boolean => spec.output !== undefined && spec.output !== 'return';
/** Hệ số nhân giới hạn thời gian (env `DSA_PERF_FACTOR`, mặc định 1). Đặt 3 khi máy đang tải / chạy `--all` hàng loạt / trên cloud. */
export const perfFactor = (): number => {
  const f = Number(process.env.DSA_PERF_FACTOR);
  return Number.isFinite(f) && f > 0 ? f : 1;
};
export const perfLimit = (perf: Perf, lang: 'ts' | 'py' | 'java') =>
  perfFactor() * (lang === 'ts' ? perf.limitMs : lang === 'py' ? (perf.py ?? perf.limitMs * 10) : (perf.java ?? perf.limitMs * 3));

/** Áp quy tắc output trên dữ liệu JSON thuần. */
export function applyOutput(spec: Spec, ret: any, args: any[] | undefined): any {
  const out = spec.output ?? 'return';
  if (out === 'return') return ret;
  if (out === 'arg0') return args![0];
  return out(ret, args!);
}

// ───────────── gọi lời giải TS: prepare (không tính giờ) → execute (tính giờ) → finish ─────────────

export interface Prepared { real: any[] }

export function prepare(spec: Spec, raw: any[]): Prepared {
  const sig = sigOf(spec);
  if (sig.kind === 'class') {
    const [ops, opArgs] = raw as [string[], any[][]];
    const real = ops.map((op, i) => {
      const params = i === 0 ? sig.ctor! : sig.methods!.find((m) => m.name === op)?.params;
      if (!params) throw new Error(`spec: thao tác "${op}" không có trong sig`);
      return (opArgs[i] ?? []).map((v, j) => fromPlain(v, params[j].type));
    });
    return { real: [ops, real] };
  }
  const params = sig.fn!.params;
  return { real: raw.map((v, i) => fromPlain(v, params[i]?.type ?? { k: 'prim', name: 'int' })) };
}

export function execute(spec: Spec, impl: any, p: Prepared): any {
  const sig = sigOf(spec);
  if (sig.kind === 'class') {
    const [ops, args] = p.real as [string[], any[][]];
    const out: any[] = [null];
    const obj = new impl(...args[0]);
    for (let i = 1; i < ops.length; i++) {
      if (typeof obj[ops[i]] !== 'function') throw new Error(`class thiếu method ${ops[i]}()`);
      const r = obj[ops[i]](...args[i]);
      out.push(r === undefined ? null : r);
    }
    return out;
  }
  return impl(...p.real);
}

export function finish(spec: Spec, ret: any, p: Prepared): any {
  const sig = sigOf(spec);
  if (sig.kind === 'class') {
    const ops = p.real[0] as string[];
    return (ret as any[]).map((v, i) => (i === 0 ? null : toPlain(v, sig.methods!.find((m) => m.name === ops[i])!.ret)));
  }
  const retPlain = toPlain(ret, sig.fn!.ret);
  const argsPlain = needArgs(spec) ? p.real.map((v, i) => toPlain(v, sig.fn!.params[i]?.type)) : undefined;
  return applyOutput(spec, retPlain, argsPlain);
}

/** Gọi trọn gói: input thô → output JSON thuần. */
export function invoke(spec: Spec, impl: any, raw: any[]): any {
  const p = prepare(spec, raw);
  return finish(spec, execute(spec, impl, p), p);
}

export function compareOutput(spec: Spec, got: any, expected: any, args: any[]): true | string {
  const c = spec.compare ?? 'exact';
  let ok: boolean | string;
  if (c === 'exact') ok = deepEqual(got, expected);
  else if (c === 'unordered') ok = deepEqual(canonical(got, false), canonical(expected, false));
  else if (c === 'unordered-deep') ok = deepEqual(canonical(got, true), canonical(expected, true));
  else if (c === 'float') ok = floatEqual(got, expected);
  else ok = c(got, expected, args);
  if (ok === true) return true;
  return typeof ok === 'string' ? ok : 'sai kết quả';
}
