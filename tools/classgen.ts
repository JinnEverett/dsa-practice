// Nhóm D: helper sinh chuỗi thao tác ngẫu nhiên cho bài class (args = [ops, opArgs]).
// step(i) trả [tên thao tác, tham số]; người gọi tự giữ trạng thái giả lập để chỉ sinh thao tác hợp lệ.
export function genOps(ctor: string, ctorArgs: any[], n: number, step: (i: number) => [string, any[]]): [string[], any[][]] {
  const ops = [ctor];
  const args = [ctorArgs];
  for (let i = 0; i < n; i++) {
    const [op, a] = step(i);
    ops.push(op);
    args.push(a);
  }
  return [ops, args];
}
