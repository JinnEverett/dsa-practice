import java.util.*;

// Bug 07 · số đồng xu ít nhất; -1 nếu không thể. Code CÓ LỖI.
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] c = coins.clone();
        Arrays.sort(c);
        int count = 0;
        for (int i = c.length - 1; i >= 0; i--) {
            count += amount / c[i];
            amount %= c[i];
        }
        return amount == 0 ? count : -1;
    }
}
