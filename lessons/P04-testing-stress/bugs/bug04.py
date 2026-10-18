from collections import deque

# Bug 04 · đường ngắn nhất (BFS). Code CÓ LỖI.
def shortest_path(n: int, edges: list[list[int]], src: int, dst: int) -> int:
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    visited = [False] * n
    q = deque([(src, 0)])
    while q:
        u, d = q.popleft()
        visited[u] = True
        if u == dst:
            return d
        for v in adj[u]:
            if not visited[v]:
                q.append((v, d + 1))
    return -1
