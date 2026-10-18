import type { Spec } from '../../tools/spec.ts';
import * as S from './solutions.ts';

const asc = (a: number[]) => a.slice().sort((x, y) => x - y);

export const specs: Record<string, Spec> = {
  '01': {
    sig: 'class MinHeap {\n  MinHeap()\n  void push(int x)\n  int pop()\n  int peek()\n  int size()\n}',
    title: 'Tự cài min-heap',
    ref: S.MinHeap,
    brute: class {
      a: number[] = [];
      push(x: number) {
        this.a.push(x);
      }
      pop() {
        const m = Math.min(...this.a);
        this.a.splice(this.a.indexOf(m), 1);
        return m;
      }
      peek() {
        return Math.min(...this.a);
      }
      size() {
        return this.a.length;
      }
    },
    cases: [
      {
        args: [['MinHeap', 'push', 'push', 'push', 'peek', 'pop', 'pop', 'size'], [[], [5], [1], [3], [], [], [], []]],
        expected: [null, null, null, null, 1, 1, 3, 1],
      },
      { args: [['MinHeap', 'push', 'push', 'pop', 'pop', 'size'], [[], [2], [2], [], [], []]], expected: [null, null, null, 2, 2, 0] },
    ],
    gen: (n, r) => {
      const ops = ['MinHeap'];
      const args: any[][] = [[]];
      let size = 0;
      // perf: nửa đầu push, nửa sau pop xen peek → bản tìm min tuyến tính O(n²)
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = size === 0 ? 'push' : n > 1000 ? (i < n / 2 ? 'push' : r.pick(['pop', 'peek'])) : r.pick(['push', 'push', 'pop', 'peek', 'size']);
        if (op === 'push') size++;
        if (op === 'pop') size--;
        ops.push(op);
        args.push(op === 'push' ? [r.int(-1e9, 1e9)] : []);
      }
      return [ops, args];
    },
    perf: { n: 2e5, limitMs: 150 },
  },
  '02': {
    sig: 'void heapSort(int[] nums)',
    title: 'Heap sort',
    ref: S.heapSort,
    brute: (nums: number[]) => asc(nums).forEach((v, i) => (nums[i] = v)),
    output: 'arg0',
    cases: [
      { args: [[5, 2, 3, 1]], expected: [1, 2, 3, 5] },
      { args: [[]], expected: [] },
      { args: [[1, 1, 1]], expected: [1, 1, 1] },
    ],
    gen: (n, r) => [r.array(n, -1e9, 1e9)],
    perf: { n: 1e5, limitMs: 150 },
  },
  '03': {
    sig: 'int findKthLargest(int[] nums, int k)',
    title: 'Phần tử lớn thứ k',
    ref: S.findKthLargest,
    brute: (nums: number[], k: number) => asc(nums)[nums.length - k],
    cases: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { args: [[1], 1], expected: 1 },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      return [r.array(len, -20, 20), r.int(1, len)];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '04': {
    sig: 'class KthLargest {\n  KthLargest(int k, int[] nums)\n  int add(int val)\n}',
    title: 'Lớn thứ k trong stream',
    ref: S.KthLargest,
    brute: class {
      k: number;
      a: number[];
      constructor(k: number, nums: number[]) {
        this.k = k;
        this.a = nums.slice();
      }
      add(v: number) {
        this.a.push(v);
        return asc(this.a)[this.a.length - this.k];
      }
    },
    cases: [
      {
        args: [['KthLargest', 'add', 'add', 'add', 'add', 'add'], [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]],
        expected: [null, 4, 5, 5, 8, 8],
      },
      { args: [['KthLargest', 'add', 'add'], [[1, []], [-3], [-2]]], expected: [null, -3, -2] },
    ],
    gen: (n, r) => {
      const k = r.int(1, n > 1000 ? 1e4 : 5);
      const init = r.array(r.int(Math.max(0, k - 1), k + 5), -100, 100);
      const ops = ['KthLargest'];
      const args: any[][] = [[k, init]];
      for (let i = 0; i < Math.max(1, n); i++) {
        ops.push('add');
        args.push([r.int(-100, 100)]);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '05': {
    sig: 'int lastStoneWeight(int[] stones)',
    title: 'Đập đá',
    ref: S.lastStoneWeight,
    brute: (stones: number[]) => {
      const a = stones.slice();
      while (a.length > 1) {
        a.sort((x, y) => x - y);
        const y = a.pop()!;
        const x = a.pop()!;
        if (y > x) a.push(y - x);
      }
      return a[0] ?? 0;
    },
    cases: [
      { args: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { args: [[1]], expected: 1 },
      { args: [[3, 3]], expected: 0 },
    ],
    gen: (n, r) => [r.array(Math.max(1, n), 1, n > 1000 ? 1e9 : 20)],
    perf: { n: 1e5, limitMs: 200 },
  },
  '06': {
    sig: 'int[][] kClosest(int[][] points, int k)',
    title: 'k điểm gần gốc tọa độ nhất',
    ref: S.kClosest,
    brute: () => null,
    compare: (got, _e, [points, k]) => {
      if (!Array.isArray(got) || got.length !== k) return `cần đúng ${k} điểm`;
      const d = (p: number[]) => p[0] * p[0] + p[1] * p[1];
      // mỗi điểm trả về phải thuộc input (tính theo multiset)
      const pool = new Map<string, number>();
      for (const p of points) pool.set(p.join(), (pool.get(p.join()) ?? 0) + 1);
      for (const p of got) {
        const c = pool.get(p.join());
        if (!c) return `điểm ${JSON.stringify(p)} không có trong input (hoặc lặp quá số lần)`;
        pool.set(p.join(), c - 1);
      }
      const want = asc(points.map(d)).slice(0, k).join();
      return asc(got.map(d)).join() === want || 'chưa phải k điểm gần nhất';
    },
    cases: [
      { args: [[[1, 3], [-2, 2]], 1], expected: [[-2, 2]] },
      { args: [[[3, 3], [5, -1], [-2, 4]], 2], expected: [[3, 3], [-2, 4]] },
      { args: [[[1, 0], [0, 1], [-1, 0]], 2], expected: [[1, 0], [0, 1]], note: 'hòa khoảng cách' },
    ],
    gen: (n, r) => {
      const len = Math.max(1, n);
      const R = n > 1000 ? 1e4 : 4;
      return [Array.from({ length: len }, () => [r.int(-R, R), r.int(-R, R)]), r.int(1, len)];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '07': {
    sig: 'int[] mergeKArrays(int[][] arrays)',
    title: 'Gộp k mảng đã sort',
    ref: S.mergeKArrays,
    brute: (arrays: number[][]) => asc(arrays.flat()),
    cases: [
      { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] },
      { args: [[[], []]], expected: [] },
      { args: [[]], expected: [] },
    ],
    gen: (n, r) => {
      const k = n > 1000 ? 1000 : r.int(0, 5);
      const arrs: number[][] = Array.from({ length: k }, () => []);
      if (k) for (let i = 0; i < n; i++) arrs[r.int(0, k - 1)].push(r.int(0, 1e6));
      return [arrs.map(asc)];
    },
    perf: { n: 1e5, limitMs: 200 },
  },
  '08': {
    sig: 'class MedianFinder {\n  MedianFinder()\n  void addNum(int num)\n  double findMedian()\n}',
    title: 'Median của stream',
    ref: S.MedianFinder,
    brute: class {
      a: number[] = [];
      addNum(x: number) {
        this.a.push(x);
      }
      findMedian() {
        const s = asc(this.a);
        const m = s.length >> 1;
        return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
      }
    },
    compare: 'float',
    cases: [
      { args: [['MedianFinder', 'addNum', 'addNum', 'findMedian', 'addNum', 'findMedian'], [[], [1], [2], [], [3], []]], expected: [null, null, null, 1.5, null, 2] },
      { args: [['MedianFinder', 'addNum', 'findMedian', 'addNum', 'findMedian'], [[], [-1], [], [-2], []]], expected: [null, null, -1, null, -1.5] },
    ],
    gen: (n, r) => {
      const ops = ['MedianFinder', 'addNum'];
      const args: any[][] = [[], [r.int(-1e5, 1e5)]];
      for (let i = 0; i < Math.max(1, n); i++) {
        const op = r.pick(['addNum', 'findMedian']);
        ops.push(op);
        args.push(op === 'addNum' ? [r.int(-1e5, 1e5)] : []);
      }
      return [ops, args];
    },
    perf: { n: 1e5, limitMs: 150 },
  },
  '09': {
    sig: 'int minMeetingRooms(int[][] intervals)',
    title: 'Số phòng họp tối thiểu',
    ref: S.minMeetingRooms,
    brute: (iv: number[][]) => {
      // số cuộc họp đồng thời lớn nhất, xét tại mỗi thời điểm bắt đầu
      let best = 0;
      for (const [s] of iv) best = Math.max(best, iv.filter(([a, b]) => a <= s && s < b).length);
      return best;
    },
    cases: [
      { args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
      { args: [[[7, 10], [2, 4]]], expected: 1 },
      { args: [[[1, 5], [5, 10]]], expected: 1 },
      { args: [[]], expected: 0 },
    ],
    gen: (n, r) =>
      [Array.from({ length: n }, () => {
        const s = r.int(0, n > 1000 ? 1e9 - 1000 : 40);
        return [s, s + r.int(1, n > 1000 ? 1e6 : 10)];
      })],
    perf: { n: 1e5, limitMs: 200 },
  },
  '10': {
    sig: 'int[] getOrder(int[][] tasks)',
    title: 'CPU đơn luồng',
    ref: S.getOrder,
    brute: (tasks: number[][]) => {
      const done = new Array(tasks.length).fill(false);
      const out: number[] = [];
      let time = 0;
      while (out.length < tasks.length) {
        let best = -1;
        for (let i = 0; i < tasks.length; i++)
          if (!done[i] && tasks[i][0] <= time && (best < 0 || tasks[i][1] < tasks[best][1])) best = i;
        if (best < 0) {
          time = Math.min(...tasks.filter((_, i) => !done[i]).map((t) => t[0]));
          continue;
        }
        done[best] = true;
        out.push(best);
        time += tasks[best][1];
      }
      return out;
    },
    cases: [
      { args: [[[1, 2], [2, 4], [3, 2], [4, 1]]], expected: [0, 2, 3, 1] },
      { args: [[[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]]], expected: [4, 3, 2, 0, 1] },
      { args: [[[5, 2], [1, 1]]], expected: [1, 0], note: 'CPU rảnh, chờ job đến' },
    ],
    gen: (n, r) => [Array.from({ length: Math.max(1, n) }, () => [r.int(1, n > 1000 ? 1e9 : 30), r.int(1, n > 1000 ? 1e9 : 6)])],
    perf: { n: 1e5, limitMs: 300 },
  },
};
