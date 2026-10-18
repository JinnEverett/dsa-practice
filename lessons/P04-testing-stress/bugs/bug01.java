// Bug 01 · vị trí chèn (lower bound). Code CÓ LỖI.
class Solution {
    public int lowerBound(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}
