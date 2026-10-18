// P03 chỉ dùng `bench` (benchOnly): `check` và `scaffold` bỏ qua module này.
// Mỗi thí nghiệm: ref = biến thể A (ngây thơ); biến thể B/C nằm cùng file experiments.ts và đo bằng `--file ... --fn ...`.
import type { Spec } from '../../tools/spec.ts';
import * as E from './experiments.ts';

const exp = (title: string, name: string, ref: (n: number) => number): Spec => ({
  sig: `long ${name}(int n)`,
  title,
  ref,
  cases: [],
  gen: (n) => [n],
  benchOnly: true,
  perf: false,
});

export const specs: Record<string, Spec> = {
  '01': exp('number[] vs Int32Array', 'sumNumberArray', E.sumNumberArray),
  '02': exp('Bảng đếm: Map vs mảng vs object', 'countWithMap', E.countWithMap),
  '03': exp('Mảng đối tượng vs mảng riêng từng trường', 'updateAoS', E.updateAoS),
  '04': exp('Tạo đối tượng trong vòng lặp nóng', 'sumManhattanAlloc', E.sumManhattanAlloc),
  '05': exp('Mảng holey vs packed', 'fillHoley', E.fillHoley),
  '06': exp('Đệ quy vs vòng lặp', 'sumRecursive', E.sumRecursive),
  '07': exp('Nối chuỗi: += vs join', 'buildPlus', E.buildPlus),
  '08': exp('Sort: comparator vs typed vs mặc định', 'sortComparator', E.sortComparator),
  '09': exp('Set<number> vs bảng bit', 'setInsert', E.setInsert),
  '10': exp('Đếm giá trị khác nhau: sort vs Set', 'uniqueBySort', E.uniqueBySort),
};
