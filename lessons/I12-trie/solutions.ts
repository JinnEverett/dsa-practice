// I12 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · Trie (insert / search / startsWith) ───
// Ý tưởng: mỗi node có `children` (Map ký tự → node) và cờ `end`. insert đi/tạo từng ký tự; search = tới được node cuối VÀ end;
//   startsWith = chỉ cần tới được node cuối. Helper `find(s)` dùng chung cho cả hai.
// Độ phức tạp: mỗi thao tác O(L) (L = độ dài chuỗi), KHÔNG phụ thuộc số từ đã lưu. Bộ nhớ O(tổng ký tự) trong trường hợp xấu nhất.
// Vì sao best practice: Map lười tạo → chỉ trả bộ nhớ cho node thật sự có. Mảng 26 con cho mỗi node nhanh hơn nhưng tốn 26 con trỏ/node
//   (3·10^6 node ≈ 78·10^6 ô) — đánh đổi bộ nhớ ↔ hằng số.
// Bẫy: search("app") khi chỉ insert("apple") phải false (thiếu cờ end); quên khởi tạo node gốc; dùng ký tự rỗng "" (search("") ở đề này không xảy ra).
// Cách khác: hash set các prefix (tốn O(tổng L²) bộ nhớ); sort + binary search.
// Python/Java: Python `dict` làm children (`node = node.setdefault(c, {})`), Java `HashMap<Character, Node>` hoặc `Node[26]` (c - 'a').
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  end = false;
}
export class Trie {
  private root = new TrieNode();
  insert(word: string): void {
    let node = this.root;
    for (const c of word) {
      let nxt = node.children.get(c);
      if (!nxt) {
        nxt = new TrieNode();
        node.children.set(c, nxt);
      }
      node = nxt;
    }
    node.end = true;
  }
  private find(s: string): TrieNode | null {
    let node = this.root;
    for (const c of s) {
      const nxt = node.children.get(c);
      if (!nxt) return null;
      node = nxt;
    }
    return node;
  }
  search(word: string): boolean {
    const n = this.find(word);
    return n !== null && n.end;
  }
  startsWith(prefix: string): boolean {
    return this.find(prefix) !== null;
  }
}

// ─── ex02 · WordDictionary (wildcard '.') ───
// Ý tưởng: cùng cấu trúc trie; search dùng DFS(node, i): gặp '.' thì thử MỌI con, ngược lại đi theo đúng một con.
// Độ phức tạp: addWord O(L). search O(L) khi không có '.', trường hợp xấu nhất O(26^d · L) với d = số dấu '.' (đề giới hạn d ≤ 2).
// Vì sao best practice: không phải quét mọi từ; nhánh sai bị cắt sớm ngay khi không có con tương ứng.
// Bẫy: kết thúc phải kiểm tra cờ end (không phải chỉ "tới được"); '.' ở cuối vẫn phải ra node có end; đệ quy sâu ≤ L nên an toàn.
// Cách khác: nhóm từ theo độ dài rồi so khớp từng từ (O(W·L) mỗi search) — đúng nhưng chậm khi nhiều từ.
// Python/Java: Python dict + đệ quy trên chỉ số; Java `Node[26]`, lặp 26 con khi gặp '.'.
export class WordDictionary {
  private root = new TrieNode();
  addWord(word: string): void {
    let node = this.root;
    for (const c of word) {
      let nxt = node.children.get(c);
      if (!nxt) {
        nxt = new TrieNode();
        node.children.set(c, nxt);
      }
      node = nxt;
    }
    node.end = true;
  }
  search(word: string): boolean {
    const dfs = (node: TrieNode, i: number): boolean => {
      if (i === word.length) return node.end;
      const c = word[i];
      if (c === '.') {
        for (const child of node.children.values()) if (dfs(child, i + 1)) return true;
        return false;
      }
      const nxt = node.children.get(c);
      return nxt !== undefined && dfs(nxt, i + 1);
    };
    return dfs(this.root, 0);
  }
}

// ─── ex03 · Word Search II (trie + backtracking trên lưới) ───
// Ý tưởng: dựng trie từ `words`; DFS từ mỗi ô, đi theo trie song song với đường đi trên lưới. Hết nhánh trie (không có con khớp) → cắt ngay.
//   Node đánh dấu từ nguyên (word) → thu thập rồi xóa (word = null) để không báo trùng.
// Độ phức tạp: O(M·N·3^(L−1)) trường hợp xấu nhất, nhưng prefix chung của các từ chỉ bị duyệt MỘT lần — khác hẳn việc chạy word search cho từng từ.
// Vì sao best practice: trie dùng chung tiền tố; có thể tỉa node lá sau khi tìm xong để lần sau không đi lại.
// Bẫy: phải đánh dấu ô đã dùng trong đường hiện tại và HOÀN TÁC khi quay lui; thu thập từ trùng (đi hai đường tới cùng từ) → đặt word = null; ô đi quá 4 hướng.
// Cách khác: chạy Word Search I cho từng từ (đúng, chậm khi nhiều từ chung tiền tố).
// Python/Java: board là String[] (mỗi hàng 1 chuỗi) → đổi sang mảng ký tự (Java `char[][]`, Python `list[list[str]]`) để đánh dấu '#'.
class WNode {
  next: Map<string, WNode> = new Map();
  word: string | null = null;
}
export function findWords(board: string[], words: string[]): string[] {
  const root = new WNode();
  for (const w of words) {
    let node = root;
    for (const c of w) {
      let nxt = node.next.get(c);
      if (!nxt) {
        nxt = new WNode();
        node.next.set(c, nxt);
      }
      node = nxt;
    }
    node.word = w;
  }
  const m = board.length;
  const n = m ? board[0].length : 0;
  const g = board.map((row) => row.split(''));
  const res: string[] = [];
  const dfs = (r: number, c: number, parent: WNode): void => {
    const ch = g[r][c];
    const node = parent.next.get(ch);
    if (!node) return;
    if (node.word !== null) {
      res.push(node.word);
      node.word = null;
    }
    g[r][c] = '#';
    if (r > 0 && g[r - 1][c] !== '#') dfs(r - 1, c, node);
    if (r < m - 1 && g[r + 1][c] !== '#') dfs(r + 1, c, node);
    if (c > 0 && g[r][c - 1] !== '#') dfs(r, c - 1, node);
    if (c < n - 1 && g[r][c + 1] !== '#') dfs(r, c + 1, node);
    g[r][c] = ch;
    if (node.next.size === 0 && node.word === null) parent.next.delete(ch); // tỉa nhánh đã hết từ
  };
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) dfs(r, c, root);
  return res;
}

// ─── ex04 · Replace words ───
// Ý tưởng: trie các "gốc từ". Với mỗi từ của câu, đi theo trie; gặp node end đầu tiên thì cắt ở đó (gốc NGẮN NHẤT); hụt đường thì giữ nguyên từ.
// Độ phức tạp: dựng O(tổng độ dài gốc), xử lý câu O(độ dài câu). Không phụ thuộc số gốc khi tra cứu (cách ngây thơ: O(số từ · số gốc · L)).
// Vì sao best practice: dừng ngay ở node end đầu tiên → tự động chọn gốc ngắn nhất.
// Bẫy: phải dừng ở end ĐẦU TIÊN (không đi tiếp); nối kết quả bằng mảng + join (cộng chuỗi trong vòng lặp dễ O(n²) ở Java/Python cũ); từ ngắn hơn gốc thì giữ nguyên.
// Cách khác: Set các gốc + thử mọi tiền tố của từ (O(L²) mỗi từ).
// Python/Java: Python `' '.join(...)`, Java `String.join(" ", list)` / StringBuilder.
export function replaceWords(dictionary: string[], sentence: string): string {
  const root = new TrieNode();
  for (const w of dictionary) {
    let node = root;
    for (const c of w) {
      let nxt = node.children.get(c);
      if (!nxt) {
        nxt = new TrieNode();
        node.children.set(c, nxt);
      }
      node = nxt;
    }
    node.end = true;
  }
  const out: string[] = [];
  for (const word of sentence.split(' ')) {
    let node = root;
    let cut = -1;
    for (let i = 0; i < word.length; i++) {
      const nxt = node.children.get(word[i]);
      if (!nxt) break;
      node = nxt;
      if (node.end) {
        cut = i + 1;
        break;
      }
    }
    out.push(cut < 0 ? word : word.slice(0, cut));
  }
  return out.join(' ');
}

// ─── ex05 · Gợi ý sản phẩm theo từng ký tự gõ ───
// Ý tưởng: sort products theo từ điển rồi chèn vào trie theo thứ tự đó; mỗi node giữ tối đa 3 từ ĐẦU TIÊN đi qua nó (đã đúng thứ tự từ điển).
//   Chỉ cần chèn tối đa |searchWord| ký tự đầu của mỗi sản phẩm. Với mỗi ký tự gõ, đi xuống một bước và đọc list của node (hết đường → các bước sau đều rỗng).
// Độ phức tạp: sort O(P · L · log P) so sánh chuỗi; chèn O(P · |searchWord|); truy vấn O(|searchWord|).
// Vì sao best practice: không quét lại toàn bộ danh sách cho mỗi ký tự (cách ngây thơ O(|searchWord| · P · L)).
// Bẫy: sản phẩm trùng tên vẫn tính riêng (có thể xuất hiện 2 lần trong top 3); so sánh chuỗi mặc định của JS/Python/Java đều theo mã ký tự — đúng với chữ thường.
// Cách khác: sort rồi binary search lower_bound(prefix) và lấy 3 phần tử kế tiếp còn khớp tiền tố, O(|searchWord| · (log P + 3) · L), bộ nhớ O(1) phụ.
// Python/Java: Python `sorted`, `bisect_left`; Java `Arrays.sort`, `Collections.binarySearch`/tự viết lower_bound.
export function suggestedProducts(products: string[], searchWord: string): string[][] {
  const sorted = products.slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  type N = { next: Map<string, N>; top: string[] };
  const root: N = { next: new Map(), top: [] };
  const depth = searchWord.length;
  for (const p of sorted) {
    let node = root;
    const lim = Math.min(p.length, depth);
    for (let i = 0; i < lim; i++) {
      let nxt = node.next.get(p[i]);
      if (!nxt) {
        nxt = { next: new Map(), top: [] };
        node.next.set(p[i], nxt);
      }
      node = nxt;
      if (node.top.length < 3) node.top.push(p);
    }
  }
  const res: string[][] = [];
  let node: N | undefined = root;
  for (const c of searchWord) {
    node = node ? node.next.get(c) : undefined;
    res.push(node ? node.top.slice() : []);
  }
  return res;
}

// ─── ex06 · Maximum XOR của hai số (trie nhị phân) ───
// Ý tưởng: chèn mọi số vào trie nhị phân 31 bit (từ bit 30 xuống 0). Với mỗi x, đi xuống và LUÔN ưu tiên nhánh có bit NGƯỢC với bit của x
//   (để bit kết quả = 1) nếu tồn tại. Kết quả lớn nhất của mọi x là đáp án. Cho phép chọn chính phần tử đó hai lần (XOR = 0) → n = 1 trả về 0.
// Độ phức tạp: O(31 · n) thời gian, O(31 · n) nút. Cài trie bằng mảng phẳng Int32Array (2 con mỗi nút) → ít cấp phát, nhanh hơn object.
// Vì sao best practice: tham lam theo từng bit từ cao xuống thấp là đúng vì bit cao quan trọng hơn mọi bit thấp cộng lại.
// Bẫy: JS toán tử bit là int32 — với giá trị < 2^31 thì ổn; nếu miền tới 2^32 phải dùng `>>> 0` hoặc BigInt. Nhớ duyệt 31 bit (không phải 32) cho miền int dương.
// Cách khác: duyệt bit từ cao xuống, dùng Set các tiền tố và thử "đoán" đáp án (O(31 · n), bộ nhớ O(n)); O(n²) vét cạn.
// Python/Java: Python int vô hạn nên không lo bit; Java `int` đủ cho 2^31 − 1, XOR hai số dương < 2^31 vẫn dương.
export function findMaximumXOR(nums: number[]): number {
  const n = nums.length;
  const B = 30;
  const ch = new Int32Array((B + 1) * n * 2 + 4); // ch[node*2 + bit]; 0 nghĩa là chưa có (node 0 là gốc)
  let cnt = 1;
  for (let i = 0; i < n; i++) {
    let node = 0;
    for (let b = B; b >= 0; b--) {
      const bit = (nums[i] >> b) & 1;
      if (!ch[node * 2 + bit]) ch[node * 2 + bit] = cnt++;
      node = ch[node * 2 + bit];
    }
  }
  let best = 0;
  for (let i = 0; i < n; i++) {
    let node = 0;
    let x = 0;
    for (let b = B; b >= 0; b--) {
      const bit = (nums[i] >> b) & 1;
      const want = ch[node * 2 + (bit ^ 1)];
      if (want) {
        x |= 1 << b;
        node = want;
      } else node = ch[node * 2 + bit];
    }
    if (x > best) best = x;
  }
  return best;
}

// ─── ex07 · Autocomplete: top 3 theo lượt tìm ───
// Ý tưởng: trie; MỖI node giữ danh sách tối đa 3 từ tốt nhất đi qua nó (sắp theo count giảm, hòa thì chữ cái). add(word): count++ rồi đi dọc
//   các node của word, cập nhật top của từng node: vì chỉ MỘT từ đổi count (tăng), top mới = top cũ ∪ {word}, sắp lại, cắt còn 3 — đúng.
//   top3(prefix): đi tới node tiền tố, trả bản sao top. Không quét danh sách từ.
// Độ phức tạp: add O(L · log 3) ≈ O(L), top3 O(L). Bộ nhớ O(tổng ký tự + 3 · số node).
// Vì sao best practice: đánh đổi bộ nhớ lấy tốc độ truy vấn — đúng bài toán đọc nhiều, ghi ít của gợi ý tìm kiếm. Cách ngây thơ: mỗi truy vấn duyệt/sắp mọi từ O(W log W).
// Bẫy: từ mới (chưa có trong constructor) → count = 1; phải loại trùng khi từ đã nằm trong top (không push hai lần); so sánh hòa theo chữ cái, không theo thứ tự chèn.
// Cách khác: node chỉ lưu count ở lá, top3 duyệt cả cây con + heap (O(kích thước cây con)) — chậm với tiền tố ngắn.
// Python/Java: Python `sorted(top, key=lambda w: (-cnt[w], w))`; Java comparator `Comparator.comparingInt((String w) -> -cnt.get(w)).thenComparing(Comparator.naturalOrder())`.
type ANode = { next: Map<string, ANode>; top: string[] };
export class Autocomplete {
  private root: ANode = { next: new Map(), top: [] };
  private cnt: Map<string, number> = new Map();
  constructor(words: string[], counts: number[]) {
    for (let i = 0; i < words.length; i++) this.put(words[i], counts[i]);
  }
  private better = (a: string, b: string): number => {
    const d = this.cnt.get(b)! - this.cnt.get(a)!;
    return d !== 0 ? d : a < b ? -1 : a > b ? 1 : 0;
  };
  private put(word: string, count: number): void {
    this.cnt.set(word, count);
    let node = this.root;
    for (const c of word) {
      let nxt = node.next.get(c);
      if (!nxt) {
        nxt = { next: new Map(), top: [] };
        node.next.set(c, nxt);
      }
      node = nxt;
      const top = node.top;
      if (!top.includes(word)) top.push(word);
      top.sort(this.better);
      if (top.length > 3) top.length = 3;
    }
  }
  add(word: string): void {
    this.put(word, (this.cnt.get(word) ?? 0) + 1);
  }
  top3(prefix: string): string[] {
    let node = this.root;
    for (const c of prefix) {
      const nxt = node.next.get(c);
      if (!nxt) return [];
      node = nxt;
    }
    return node.top.slice();
  }
}

// ─── ex08 · StreamChecker (lọc từ cấm trong luồng) ───
// Ý tưởng: dựng trie của các từ ĐẢO NGƯỢC. Giữ luồng ký tự gần nhất (tối đa maxLen). query(c): thêm c, rồi đi từ ký tự MỚI NHẤT ngược về quá khứ
//   trong trie; gặp node end → có từ cấm là hậu tố của luồng.
// Độ phức tạp: query O(maxLen) (maxLen = độ dài từ dài nhất), không phụ thuộc số từ. Bộ nhớ O(tổng ký tự + maxLen).
// Vì sao best practice: so khớp HẬU TỐ của luồng với một tập từ — đảo từ để biến hậu tố thành tiền tố. Aho–Corasick (A10) cho O(1) mỗi ký tự.
// Bẫy: chỉ cần kiểm tra tối đa maxLen ký tự cuối (đừng lưu cả luồng vô hạn → rò bộ nhớ trong dịch vụ chạy lâu: dùng vòng/ring buffer);
//   dừng sớm khi hết đường trong trie; từ độ dài 1 cũng phải bắt được.
// Cách khác: mỗi query duyệt mọi từ và so endsWith: O(W · L) mỗi ký tự — chậm với nhiều từ.
// Python/Java: `char` ↔ chuỗi 1 ký tự trong Python; Java `char` thật. Java: `StringBuilder`/`char[]` ring buffer cho luồng.
export class StreamChecker {
  private root = new TrieNode();
  private buf: string[];
  private maxLen = 0;
  private len = 0; // số ký tự đã nhận (tổng)
  constructor(words: string[]) {
    for (const w of words) {
      this.maxLen = Math.max(this.maxLen, w.length);
      let node = this.root;
      for (let i = w.length - 1; i >= 0; i--) {
        let nxt = node.children.get(w[i]);
        if (!nxt) {
          nxt = new TrieNode();
          node.children.set(w[i], nxt);
        }
        node = nxt;
      }
      node.end = true;
    }
    this.buf = new Array(this.maxLen);
  }
  query(letter: string): boolean {
    const m = this.maxLen;
    this.buf[this.len % m] = letter;
    this.len++;
    let node = this.root;
    const steps = Math.min(m, this.len);
    for (let k = 0; k < steps; k++) {
      const nxt = node.children.get(this.buf[(this.len - 1 - k) % m]);
      if (!nxt) return false;
      node = nxt;
      if (node.end) return true;
    }
    return false;
  }
}
