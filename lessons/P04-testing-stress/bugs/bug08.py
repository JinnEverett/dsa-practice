# Bug 08 · thứ tự duyệt BFS (hàng xóm tăng dần). Code CÓ LỖI.
def bfs_order(n: int, edges: list[list[int]], src: int) -> list[int]:
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    for lst in adj:
        lst.sort()
    seen = [False] * n
    seen[src] = True
    queue = [src]
    order = []
    while queue:
        u = queue.pop(0)
        order.append(u)
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                queue.append(v)
    return order
