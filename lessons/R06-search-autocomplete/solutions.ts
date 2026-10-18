// R06 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Gợi ý top-k có cache tại node ───
// Ý tưởng: trie; MỖI node giữ sẵn danh sách tối đa k từ tốt nhất đi qua nó (đã sắp: weight giảm, từ tăng).
// `query(prefix)` chỉ đi theo prefix tới node rồi trả bản sao cache: O(|prefix| + k).
// `add(word, w)`: cộng weight vào tổng của từ, rồi trên đường từ gốc tới từ, ở mỗi node xóa bản ghi cũ của từ (nếu có)
// và chèn lại đúng chỗ, cắt còn k. Đúng vì weight chỉ TĂNG: từ đã bị loại khỏi cache một node không thể quay lại trừ khi
// chính nó được cộng thêm — và khi đó nó đi qua `add` này.
// Độ phức tạp: add O(|w| · k) · query O(|p| + k) · space O(tổng độ dài · k) trong trường hợp xấu.
// Vì sao best practice: đánh đổi bộ nhớ lấy thời gian đọc — đúng với autocomplete (đọc ≫ ghi). Quét mọi từ có tiền tố
// là O(#từ) mỗi lần gõ phím.
// Bẫy: cập nhật cache của MỌI node trên đường đi (kể cả gốc nếu prefix rỗng); tie-break chữ cái; cắt đúng k.
// Python: `dict` làm children, list các tuple `(-weight, word)`; Java: `HashMap<Character, Node>` hoặc `Node[26]`.
interface SNode {
  ch: Map<string, SNode>;
  top: { w: string; wt: number }[];
}
const better = (a: { w: string; wt: number }, b: { w: string; wt: number }) => a.wt > b.wt || (a.wt === b.wt && a.w < b.w);
export class Suggest {
  private k: number;
  private root: SNode = { ch: new Map(), top: [] };
  private total = new Map<string, number>();
  constructor(k: number) {
    this.k = k;
  }
  add(word: string, weight: number): void {
    const wt = (this.total.get(word) ?? 0) + weight;
    this.total.set(word, wt);
    const entry = { w: word, wt };
    let node = this.root;
    this.touch(node, entry);
    for (const c of word) {
      let nx = node.ch.get(c);
      if (!nx) node.ch.set(c, (nx = { ch: new Map(), top: [] }));
      node = nx;
      this.touch(node, entry);
    }
  }
  private touch(node: SNode, e: { w: string; wt: number }): void {
    const t = node.top;
    const old = t.findIndex((x) => x.w === e.w);
    if (old >= 0) t.splice(old, 1);
    let i = t.length;
    while (i > 0 && better(e, t[i - 1])) i--;
    t.splice(i, 0, e);
    if (t.length > this.k) t.pop();
  }
  query(prefix: string): string[] {
    let node = this.root;
    for (const c of prefix) {
      const nx = node.ch.get(c);
      if (!nx) return [];
      node = nx;
    }
    return node.top.map((x) => x.w);
  }
}

// ─── ex02 · Inverted index (AND) ───
// Ý tưởng: token → danh sách docId tăng dần (postings). Vì docId đưa vào TĂNG NGẶT nên chỉ cần `push` (bỏ trùng bằng
// cách so phần tử cuối). Truy vấn: lấy postings của mọi token, giao từ danh sách NGẮN NHẤT: với mỗi doc trong danh sách ngắn,
// binary search trong các danh sách còn lại.
// Độ phức tạp: add O(|text|) · query O(m · s · log L), s = độ dài danh sách ngắn nhất — không đụng tới số doc không liên quan.
// Vì sao best practice: quét mọi doc là O(#doc · |text|) mỗi truy vấn; inverted index là xương sống của Lucene/Elasticsearch.
// Bẫy: token lặp trong cùng một doc; token lặp trong truy vấn; truy vấn có token chưa từng xuất hiện → rỗng ngay; chuỗi rỗng.
// Python: `defaultdict(list)` + `bisect`; Java: `HashMap<String, List<Integer>>` + `Collections.binarySearch`.
const tokens = (s: string): string[] => s.toLowerCase().split(/\s+/).filter(Boolean);
export class SearchIndex {
  private post = new Map<string, number[]>();
  add(docId: number, text: string): void {
    for (const t of tokens(text)) {
      let p = this.post.get(t);
      if (!p) this.post.set(t, (p = []));
      if (p[p.length - 1] !== docId) p.push(docId);
    }
  }
  query(q: string): number[] {
    const qs = [...new Set(tokens(q))];
    if (qs.length === 0) return [];
    const lists: number[][] = [];
    for (const t of qs) {
      const p = this.post.get(t);
      if (!p) return [];
      lists.push(p);
    }
    lists.sort((a, b) => a.length - b.length);
    const has = (arr: number[], x: number) => {
      let lo = 0;
      let hi = arr.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] === x) return true;
        if (arr[mid] < x) lo = mid + 1;
        else hi = mid - 1;
      }
      return false;
    };
    return lists[0].filter((d) => lists.every((l, i) => i === 0 || has(l, d)));
  }
}

// ─── ex03 · Fuzzy match theo khoảng cách sửa (Levenshtein) ───
// Ý tưởng: với mỗi từ điển, tính khoảng cách có NGƯỠNG: bỏ ngay nếu chênh lệch độ dài > maxDist, và dừng sớm khi cả một hàng
// DP đều > maxDist. Sắp kết quả theo (khoảng cách, từ).
// Độ phức tạp: O(|dict| · |q| · maxDist) nếu dùng dải chéo; bản đơn giản dưới đây O(|dict| · |q| · |w|) nhưng có cắt sớm.
// Bẫy: DP hai hàng (rolling) thay vì ma trận đầy đủ; từ trong từ điển bằng q → khoảng cách 0; sắp theo (dist, word).
// Khi từ điển rất lớn: BK-tree (ex05) hoặc n-gram/ symmetric delete index.
export function lev(a: string, b: string, limit = Infinity): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev = new Int32Array(b.length + 1);
  let cur = new Int32Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > limit) return limit + 1;
    [prev, cur] = [cur, prev];
  }
  return prev[b.length];
}
export function fuzzyMatch(dict: string[], q: string, maxDist: number): string[] {
  const hits: [number, string][] = [];
  for (const w of dict) {
    const d = lev(w, q, maxDist);
    if (d <= maxDist) hits.push([d, w]);
  }
  hits.sort((x, y) => x[0] - y[0] || (x[1] < y[1] ? -1 : x[1] > y[1] ? 1 : 0));
  return hits.map((h) => h[1]);
}

// ─── ex04 · Tìm tên tiếng Việt không dấu ───
// Ý tưởng: chuẩn hóa MỌI chuỗi về dạng so khớp: Unicode NFD (tách dấu thành ký tự kết hợp) → bỏ ký tự kết hợp (U+0300–U+036F)
// → `đ`/`Đ` thành `d` (đ KHÔNG phân rã trong NFD) → chữ thường. Tên khớp khi MỖI token của truy vấn là tiền tố của một token tên.
// Độ phức tạp: O(tổng độ dài) cho chuẩn hóa + O(#tên · #token) so khớp. Với danh bạ lớn: chuẩn hóa MỘT lần khi nạp và đưa vào trie/index.
// Bẫy: quên `đ`; so sánh bằng `toLowerCase` trên chuỗi còn dấu; dữ liệu có thể là dạng dựng sẵn (NFC) HOẶC tổ hợp (NFD) —
// phải chuẩn hóa cả hai phía.
// Python: `unicodedata.normalize('NFD', s)` + lọc `unicodedata.combining`; Java: `java.text.Normalizer.normalize(s, Normalizer.Form.NFD)` + regex `\p{M}+`.
export function normalizeVi(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}
export function searchVietnamese(names: string[], query: string): string[] {
  const qs = normalizeVi(query).split(/\s+/).filter(Boolean);
  return names.filter((name) => {
    const ts = normalizeVi(name).split(/\s+/).filter(Boolean);
    return qs.every((q) => ts.some((t) => t.startsWith(q)));
  });
}

// ─── ex05 · BK-tree ───
// Ý tưởng: mỗi node là một từ; cạnh tới con gắn nhãn d = lev(con, cha). Tìm q với ngưỡng m: tại node x tính d = lev(q, x);
// nếu d ≤ m thì x là kết quả; chỉ đi xuống các con có nhãn trong [d − m, d + m] — bất đẳng thức tam giác của khoảng cách sửa
// bảo đảm các nhánh khác không thể chứa kết quả.
// Độ phức tạp: add O(độ sâu · lev); search: trung bình chỉ thăm một phần nhỏ cây khi từ điển có cấu trúc và m nhỏ
// (đo thật ở checks: ~2–5% số node cho m = 1); xấu nhất O(n · lev). Với chuỗi ngẫu nhiên đều, các khoảng cách dồn vào vài giá trị
// nên BK-tree cắt tỉa kém — nó hợp với từ điển ngôn ngữ thật.
// Bẫy: từ trùng (bỏ qua); sắp kết quả theo (dist, word); đệ quy sâu → dùng stack.
// Python: `dict` nhãn → node; Java: `HashMap<Integer, Node>`.
interface BKNode {
  w: string;
  ch: Map<number, BKNode>;
}
export class BKTree {
  private root: BKNode | null = null;
  add(word: string): void {
    if (!this.root) {
      this.root = { w: word, ch: new Map() };
      return;
    }
    let cur = this.root;
    for (;;) {
      const d = lev(word, cur.w);
      if (d === 0) return;
      const nx = cur.ch.get(d);
      if (!nx) {
        cur.ch.set(d, { w: word, ch: new Map() });
        return;
      }
      cur = nx;
    }
  }
  search(q: string, maxDist: number): string[] {
    const hits: [number, string][] = [];
    const st: BKNode[] = this.root ? [this.root] : [];
    while (st.length) {
      const nd = st.pop()!;
      const d = lev(q, nd.w);
      if (d <= maxDist) hits.push([d, nd.w]);
      for (const [k, c] of nd.ch) if (k >= d - maxDist && k <= d + maxDist) st.push(c);
    }
    hits.sort((x, y) => x[0] - y[0] || (x[1] < y[1] ? -1 : x[1] > y[1] ? 1 : 0));
    return hits.map((h) => h[1]);
  }
}
