import java.util.*;

// Bug 03 · phần tử nhỏ thứ k. Code CÓ LỖI — tương đương Java: sắp mảng String chứa số.
class Solution {
    public int kthSmallest(int[] nums, int k) {
        String[] a = new String[nums.length];
        for (int i = 0; i < nums.length; i++) a[i] = String.valueOf(nums[i]);
        Arrays.sort(a);
        return Integer.parseInt(a[k - 1]);
    }
}
