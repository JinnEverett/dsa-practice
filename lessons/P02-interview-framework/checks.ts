import type { Spec } from '../../tools/spec.ts';
import type { Rng } from '../../tools/lib.ts';
import * as S from './solutions.ts';

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'int longestDistinctRun(String[] requestIds)',
    title: 'Đoạn request liên tiếp dài nhất không trùng id',
    ref: S.longestDistinctRun,
    brute: (ids: string[]) => {
      let best = 0;
      for (let i = 0; i < ids.length; i++) {
        const seen = new Set<string>();
        for (let j = i; j < ids.length && !seen.has(ids[j]); j++) {
          seen.add(ids[j]);
          best = Math.max(best, j - i + 1);
        }
      }
      return best;
    },
    cases: [
      { args: [['a', 'b', 'a', 'c']], expected: 3 },
      { args: [['x', 'x', 'x']], expected: 1 },
      { args: [[]], expected: 0 },
      { args: [['a', 'b', 'c', 'a', 'b', 'c']], expected: 3 },
      { args: [['a', 'b', 'b', 'a']], expected: 2, note: 'l không được kéo lùi khi id cũ đã nằm ngoài cửa sổ' },
    ],
    gen: (n, r) => [Array.from({ length: n }, () => 'id' + r.int(0, n > 200 ? 1_000_000_000 : Math.max(2, Math.floor(n / 2))))],
    // id gần như đôi một khác nhau ⇒ cửa sổ dài ~n: duyệt lại từ mỗi điểm bắt đầu là O(n²)
    perf: { n: 1e5, limitMs: 80 },
  },
  '02': {
    sig: 'int[][] mergeMaintenanceWindows(int[][] windows)',
    title: 'Gộp khung giờ bảo trì',
    ref: S.mergeMaintenanceWindows,
    brute: (windows: number[][]) => {
      let cur = windows.map((w) => [w[0], w[1]]);
      for (let changed = true; changed; ) {
        changed = false;
        outer: for (let i = 0; i < cur.length; i++)
          for (let j = i + 1; j < cur.length; j++)
            if (cur[i][0] <= cur[j][1] && cur[j][0] <= cur[i][1]) {
              cur[i] = [Math.min(cur[i][0], cur[j][0]), Math.max(cur[i][1], cur[j][1])];
              cur.splice(j, 1);
              changed = true;
              break outer;
            }
      }
      return cur.sort((a, b) => a[0] - b[0]);
    },
    cases: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]], note: 'chạm nhau tại 4 ⇒ gộp' },
      { args: [[[1, 4], [2, 3]]], expected: [[1, 4]], note: 'khung lồng nhau: phải dùng max' },
      { args: [[]], expected: [] },
      { args: [[[5, 5], [1, 2]]], expected: [[1, 2], [5, 5]], note: 'khung độ dài 0; đầu vào chưa sắp' },
      { args: [[[1, 1000000000], [2, 3]]], expected: [[1, 1000000000]] },
    ],
    gen: (n, r) =>
      [
        Array.from({ length: n }, () => {
          const s = r.int(0, n > 200 ? 1_000_000_000 : 40);
          return [s, s + r.int(0, n > 200 ? 100000 : 6)];
        }),
      ],
    perf: { n: 1e5, limitMs: 150 },
  },
  '03': {
    sig: 'int countClusters(String[] grid)',
    title: 'Đếm cụm máy chủ liền kề',
    ref: S.countClusters,
    brute: (grid: string[]) => {
      // union-find độc lập với BFS của ref
      const R = grid.length;
      const C = R ? grid[0].length : 0;
      const p = Array.from({ length: R * C }, (_, i) => i);
      const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
      for (let r = 0; r < R; r++)
        for (let c = 0; c < C; c++) {
          if (grid[r][c] !== '#') continue;
          if (r + 1 < R && grid[r + 1][c] === '#') p[find(r * C + c)] = find((r + 1) * C + c);
          if (c + 1 < C && grid[r][c + 1] === '#') p[find(r * C + c)] = find(r * C + c + 1);
        }
      const roots = new Set<number>();
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === '#') roots.add(find(r * C + c));
      return roots.size;
    },
    cases: [
      { args: [['##..', '#...', '..#.']], expected: 2 },
      { args: [['###', '###']], expected: 1 },
      { args: [['..']], expected: 0 },
      { args: [[]], expected: 0 },
      { args: [['#.#']], expected: 2 },
      { args: [['#.', '.#']], expected: 2, note: 'chéo KHÔNG tính là liền kề' },
    ],
    gen: (n, r) => {
      if (n > 200) {
        // một cụm khổng lồ hình rắn (DFS đệ quy sâu ≈ số ô) — đệ quy tràn stack
        const side = Math.floor(Math.sqrt(1e5));
        return [Array.from({ length: side }, () => '#'.repeat(side))];
      }
      const R = r.int(0, 6);
      const C = r.int(1, 6);
      return [Array.from({ length: R }, () => r.string(C, '#.#.#'))];
    },
    // cụm 316×316 = 99 856 ô: DFS đệ quy tràn stack, BFS/DFS lặp thì qua
    perf: { n: 1e5, limitMs: 80 },
  },
};
