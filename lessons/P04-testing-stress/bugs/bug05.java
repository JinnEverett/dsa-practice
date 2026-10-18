// Bug 05 · tích theo mod. Code CÓ LỖI (int tràn).
class Solution {
    public int productMod(int[] nums, int mod) {
        int p = 1;
        for (int x : nums) p = (p * x) % mod;
        return p;
    }
}
