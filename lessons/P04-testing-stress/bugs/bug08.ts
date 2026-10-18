// Bug 08 · thứ tự duyệt BFS từ `src` (hàng xóm theo id tăng dần), chỉ các nút tới được. Code CÓ LỖI.
export function bfsOrder(n: number, edges: number[][], src: number): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  for (const list of adj) list.sort((x, y) => x - y);
  const seen = new Array<boolean>(n).fill(false);
  seen[src] = true;
  const queue = [src];
  const order: number[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj[u]) {
      if (!seen[v]) {
        seen[v] = true;
        queue.push(v);
      }
    }
  }
  return order;
}
