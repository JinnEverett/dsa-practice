// Bug 01 · vị trí chèn (lower bound). Đề: ex01 trong exercises.md. Code CÓ LỖI.
export function lowerBound(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
