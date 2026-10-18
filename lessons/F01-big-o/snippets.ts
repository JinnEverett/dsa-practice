// F01 · Phần A: đoán Big-O thời gian và bộ nhớ của từng hàm, ghi vào answers/bigo.md TRƯỚC khi bench.
//   node tools/bench.ts lessons/F01-big-o b01 --src solutions --scales s,m,l

export function b01(nums: number[]): number {
  let best = -Infinity;
  for (const x of nums) if (x > best) best = x;
  return best;
}

export function b02(nums: number[]): number {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) count++;
    }
  }
  return count;
}

export function b03(n: number): number {
  let steps = 0;
  for (let i = 1; i < n; i *= 2) steps++;
  return steps;
}

export function b04(n: number): number {
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 1; j < n; j *= 2) total++;
  }
  return total;
}

export function b05(nums: number[]): number[] {
  const out: number[] = [];
  for (const x of nums) {
    if (!out.includes(x)) out.push(x);
  }
  return out;
}

export function b06(nums: number[]): number {
  const queue = nums.slice();
  let total = 0;
  while (queue.length > 0) total += queue.shift()!;
  return total;
}

export function b07(nums: number[]): number {
  const sorted = nums.slice().sort((a, b) => a - b);
  let gaps = 0;
  for (let i = 1; i < sorted.length; i++) if (sorted[i] !== sorted[i - 1]) gaps++;
  return gaps;
}

export function b08(n: number): number {
  if (n <= 1) return n;
  return b08(n - 1) + b08(n - 2);
}

export function b09(nums: number[]): number {
  // nums đã được sắp xếp tăng dần
  let pairs = 0;
  let j = 0;
  for (let i = 0; i < nums.length; i++) {
    while (j < nums.length && nums[j] - nums[i] <= 10) j++;
    pairs += j - i - 1;
  }
  return pairs;
}

export function b10(nums: number[]): number {
  const counts: Record<string, number> = {};
  let distinctSeen = 0;
  for (const x of nums) {
    counts[x] = (counts[x] ?? 0) + 1;
    distinctSeen += Object.keys(counts).length;
  }
  return distinctSeen;
}
