// Dựng bộ test cho một bài: cases cố định → stress ngẫu nhiên (n tăng dần) → perf. Dùng chung cho mọi ngôn ngữ.
import { Rng } from './lib.ts';
import { invoke, type Spec } from './spec.ts';

export interface PlanTest {
  phase: 'cases' | 'stress';
  args: any[];
  /** Đáp án JSON thuần; undefined = không có nguồn độc lập (chỉ kiểm tra chạy không lỗi). */
  expected?: any;
  n?: number;
  note?: string;
}

export interface Plan {
  tests: PlanTest[];
  nCases: number;
  selfOnly: number;
  stress: { runs: number; maxN: number; against: string } | { skipped: string };
  perf: { n: number; args: any[] } | null;
}

/**
 * oracle: lời giải dùng làm "đáp án đúng" (ref khi chấm bài học viên, brute khi kiểm chứng ref).
 * skipStressOracle: true khi không có oracle độc lập.
 */
export function buildPlan(spec: Spec, oracle: any, oracleName: string): Plan {
  const tests: PlanTest[] = [];
  let selfOnly = 0;
  for (const c of spec.cases) {
    let expected: any;
    if ('expected' in c) expected = c.expected;
    else if (oracle) expected = invoke(spec, oracle, c.args);
    else selfOnly++;
    tests.push({ phase: 'cases', args: c.args, expected, note: c.note });
  }
  let stress: Plan['stress'];
  if (spec.stress !== false && spec.gen && oracle) {
    const runs = spec.stress?.runs ?? 300;
    const minN = spec.stress?.minN ?? 0;
    const maxN = spec.stress?.maxN ?? 30;
    const r = new Rng(42);
    for (let i = 0; i < runs; i++) {
      const n = minN + Math.floor((i * (maxN - minN + 1)) / runs);
      const args = spec.gen(n, r);
      tests.push({ phase: 'stress', args, expected: invoke(spec, oracle, args), n });
    }
    stress = { runs, maxN, against: oracleName };
  } else {
    stress = { skipped: !spec.gen ? 'không có gen' : spec.stress === false ? 'tắt' : 'không có brute' };
  }
  const perf = spec.perf && spec.gen ? { n: spec.perf.n, args: spec.gen(spec.perf.n, new Rng(7)) } : null;
  return { tests, nCases: spec.cases.length, selfOnly, stress, perf };
}
