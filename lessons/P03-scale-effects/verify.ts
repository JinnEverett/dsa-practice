// Kiểm tra hai biến thể của mỗi thí nghiệm trả cùng kết quả: node lessons/P03-scale-effects/verify.ts
import * as E from './experiments.ts';

const pairs: [string, (n: number) => number, (n: number) => number][] = [
  ['01', E.sumNumberArray, E.sumInt32Array],
  ['02', E.countWithMap, E.countWithArray],
  ['02', E.countWithMap, E.countWithObject],
  ['03', E.updateAoS, E.updateSoA],
  ['04', E.sumManhattanAlloc, E.sumManhattanInline],
  ['05', E.fillHoley, E.fillPacked],
  ['06', E.sumRecursive, E.sumLoop],
  ['07', E.buildPlus, E.buildJoin],
  ['08', E.sortComparator, E.sortTyped],
  ['09', E.setInsert, E.bitsetInsert],
  ['10', E.uniqueBySort, E.uniqueBySet],
];
let bad = 0;
for (const [id, a, b] of pairs) {
  for (const n of [1, 10, 1000, 100_000]) {
    const x = a(n);
    const y = b(n);
    if (x !== y) {
      console.log(`❌ ${id} ${a.name} vs ${b.name} n=${n}: ${x} ≠ ${y}`);
      bad++;
    }
  }
}
console.log(bad ? `${bad} cặp lệch` : '✅ mọi cặp trả cùng kết quả');
process.exit(bad ? 1 : 0);
