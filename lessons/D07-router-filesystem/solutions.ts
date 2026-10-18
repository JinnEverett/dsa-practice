// D07 · Đáp án best practice. Chỉ mở sau khi check ✅.

const segmentsOf = (path: string): string[] => (path === '/' ? [] : path.slice(1).split('/'));

// ─── ex01 · Router ───
// Ý tưởng: TRIE theo từng đoạn đường dẫn (segment). Mỗi nút có: `statics` (Map đoạn → nút con), `param` (một nút con cho mọi `:name`),
//   `wild` (handler của mẫu kết thúc bằng `*` tại nút này), `handler` (mẫu kết thúc đúng tại nút này).
//   add: đi theo từng đoạn của mẫu, tạo nút khi thiếu; `:name` đều đi vào cùng nhánh `param` (tên tham số không ảnh hưởng đối sánh);
//   `*` (đoạn cuối) ghi vào `wild`. match: DFS theo thứ tự ưu tiên tĩnh → tham số → wildcard, QUAY LUI nếu nhánh ưu tiên cao thất bại ở sâu hơn.
// Bất biến: hai mẫu cùng "hình dạng" (bỏ tên tham số) dùng chung đường đi, mẫu thêm sau ghi đè handler; `wild` chỉ cần ≥ 1 đoạn còn lại.
// Độ phức tạp: add O(L) · match O(L) thông thường; xấu nhất duyệt mỗi nút trie nhiều nhất một lần (mỗi nút ứng với một đường chọn duy nhất) · space O(tổng độ dài mẫu).
// Vì sao best practice: tra cứu không phụ thuộc số route (khác quét tuyến tính mọi mẫu mỗi request), ưu tiên được mã hóa trong thứ tự duyệt.
// Bẫy: không quay lui (`/a/b` tĩnh gặp ngõ cụt ở `/a/b/c` thì phải thử `/a/:x/c`); `*` khớp 0 đoạn; coi `:id` và `:name` là hai nhánh khác nhau;
//   cắt chuỗi bằng regex mỗi lần match; tạo mảng con ở mỗi bước đệ quy (chi phí thật khi path dài).
// Cách khác: biên dịch mỗi mẫu thành RegExp rồi thử lần lượt (Express cũ) — O(số route) mỗi request; radix tree nén đường đi (Fastify `find-my-way`, httprouter của Go).
// Python/Java: Python dict lồng nhau / class Node; Java `HashMap<String, Node>`.
interface RNode {
  statics: Map<string, RNode>;
  param: RNode | null;
  wild: string | null;
  handler: string | null;
}
const rnode = (): RNode => ({ statics: new Map(), param: null, wild: null, handler: null });

export class Router {
  private root = rnode();

  add(pattern: string, handler: string): void {
    const segs = segmentsOf(pattern);
    let cur = this.root;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (s === '*') {
        cur.wild = handler;
        return;
      }
      if (s[0] === ':') cur = cur.param ?? (cur.param = rnode());
      else {
        let nx = cur.statics.get(s);
        if (!nx) cur.statics.set(s, (nx = rnode()));
        cur = nx;
      }
    }
    cur.handler = handler;
  }
  match(path: string): string | null {
    return this.walk(this.root, segmentsOf(path), 0);
  }
  private walk(node: RNode, segs: string[], i: number): string | null {
    if (i === segs.length) return node.handler;
    const st = node.statics.get(segs[i]);
    if (st) {
      const r = this.walk(st, segs, i + 1);
      if (r !== null) return r;
    }
    if (node.param) {
      const r = this.walk(node.param, segs, i + 1);
      if (r !== null) return r;
    }
    return node.wild;
  }
}

// ─── ex02 · FileSystem ───
// Ý tưởng: trie thư mục. Nút là thư mục (`children: Map<tên, nút>`) hoặc tệp (`content !== null`). Mọi lệnh bắt đầu bằng tách đường dẫn thành các đoạn và đi từ gốc.
//   mkdir: đi và tạo thư mục còn thiếu (tạo cả thư mục cha). addContentToFile: đi tới thư mục cha (tạo nếu thiếu), tệp chưa có thì tạo rồi nối nội dung.
//   ls: nếu nút là tệp trả [tên tệp]; nếu là thư mục trả tên các con SẮP XẾP từ điển.
// Bất biến: một nút là hoặc thư mục (content === null) hoặc tệp (content !== null), không cả hai; tên con duy nhất trong một thư mục.
// Độ phức tạp: mkdir/addContent/read O(L + độ dài nội dung) · ls O(L + k log k) với k = số con (sort) · space O(tổng số nút + nội dung).
// Vì sao best practice: mỗi đoạn tra cứu O(1), không quét toàn bộ cây.
// Bẫy: nối nội dung bằng `+=` trên chuỗi lớn nhiều lần (V8 dùng rope nên ổn; nhưng Python `+=` trên `str` lặp rất nhiều có thể O(n²) — dùng list rồi join nếu cần);
//   `ls` trên tệp phải trả CHỈ tên tệp (không phải đường dẫn đầy đủ); quên sắp xếp; mkdir đè lên tệp.
// Cách khác: lưu phẳng `Map<đường dẫn, loại>` — ls phải quét mọi đường dẫn O(tổng). Sắp xếp lười: giữ `Set` đã sort (cây) nếu ls rất nhiều.
// Python/Java: Python `sorted(children)`; Java `TreeMap<String, Node>` cho `ls` tự sắp xếp.
interface FNode {
  children: Map<string, FNode>;
  content: string | null;
}
const fnode = (content: string | null = null): FNode => ({ children: new Map(), content });

export class FileSystem {
  private root = fnode();

  ls(path: string): string[] {
    const segs = segmentsOf(path);
    let cur = this.root;
    for (const s of segs) cur = cur.children.get(s)!;
    if (cur.content !== null) return [segs[segs.length - 1]];
    return [...cur.children.keys()].sort();
  }
  mkdir(path: string): void {
    this.walkCreate(segmentsOf(path));
  }
  addContentToFile(filePath: string, content: string): void {
    const segs = segmentsOf(filePath);
    const name = segs.pop()!;
    const dir = this.walkCreate(segs);
    const f = dir.children.get(name);
    if (f) f.content += content;
    else dir.children.set(name, fnode(content));
  }
  readContentFromFile(filePath: string): string {
    let cur = this.root;
    for (const s of segmentsOf(filePath)) cur = cur.children.get(s)!;
    return cur.content!;
  }
  private walkCreate(segs: string[]): FNode {
    let cur = this.root;
    for (const s of segs) {
      let nx = cur.children.get(s);
      if (!nx) cur.children.set(s, (nx = fnode()));
      cur = nx;
    }
    return cur;
  }
}
