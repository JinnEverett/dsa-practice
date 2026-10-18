import java.util.*;

// Bug 06 · giá trị lớn thứ hai (khác nhau); -1 nếu không có. Code CÓ LỖI.
class Solution {
    public int secondLargest(int[] nums) {
        Arrays.sort(nums);
        for (int i = nums.length - 2; i >= 0; i--) if (nums[i] != nums[nums.length - 1]) return nums[i];
        return -1;
    }
}
