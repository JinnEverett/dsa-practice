import java.util.*;

// Bug 04 · đường ngắn nhất (BFS). Code CÓ LỖI.
class Solution {
    public int shortestPath(int n, int[][] edges, int src, int dst) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        boolean[] visited = new boolean[n];
        Deque<int[]> q = new ArrayDeque<>();
        q.add(new int[]{src, 0});
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            visited[cur[0]] = true;
            if (cur[0] == dst) return cur[1];
            for (int v : adj.get(cur[0])) if (!visited[v]) q.add(new int[]{v, cur[1] + 1});
        }
        return -1;
    }
}
