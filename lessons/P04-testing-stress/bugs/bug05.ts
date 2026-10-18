// Bug 05 · tích các phần tử theo mod. Code CÓ LỖI.
export function productMod(nums: number[], mod: number): number {
  let p = 1;
  for (const x of nums) p = (p * x) % mod;
  return p;
}
