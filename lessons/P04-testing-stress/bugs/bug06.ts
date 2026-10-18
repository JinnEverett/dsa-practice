// Bug 06 · giá trị lớn thứ hai (khác nhau); -1 nếu có ít hơn 2 giá trị khác nhau. Code CÓ LỖI.
export function secondLargest(nums: number[]): number {
  nums.sort((a, b) => b - a);
  for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[0]) return nums[i];
  return -1;
}
