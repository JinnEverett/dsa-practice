import java.util.*;

// Bug 08 · thứ tự duyệt BFS (hàng xóm tăng dần). Code CÓ LỖI.
class Solution {
    public int[] bfsOrder(int n, int[][] edges, int src) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        for (List<Integer> l : adj) Collections.sort(l);
        boolean[] seen = new boolean[n];
        seen[src] = true;
        List<Integer> queue = new ArrayList<>();
        queue.add(src);
        List<Integer> order = new ArrayList<>();
        while (!queue.isEmpty()) {
            int u = queue.remove(0);
            order.add(u);
            for (int v : adj.get(u)) if (!seen[v]) { seen[v] = true; queue.add(v); }
        }
        int[] res = new int[order.size()];
        for (int i = 0; i < res.length; i++) res[i] = order.get(i);
        return res;
    }
}
