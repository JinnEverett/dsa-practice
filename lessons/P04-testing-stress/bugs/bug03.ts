// Bug 03 · phần tử nhỏ thứ k (k tính từ 1). Code CÓ LỖI.
export function kthSmallest(nums: number[], k: number): number {
  const a = nums.slice();
  a.sort();
  return a[k - 1];
}
