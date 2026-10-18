// Bug 04 · đường ngắn nhất (BFS) trong đồ thị vô hướng, -1 nếu không tới. Code CÓ LỖI.
export function shortestPath(n: number, edges: number[][], src: number, dst: number): number {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const visited = new Array<boolean>(n).fill(false);
  const queue: [number, number][] = [[src, 0]];
  let head = 0;
  while (head < queue.length) {
    const [u, d] = queue[head++];
    visited[u] = true;
    if (u === dst) return d;
    for (const v of adj[u]) if (!visited[v]) queue.push([v, d + 1]);
  }
  return -1;
}
