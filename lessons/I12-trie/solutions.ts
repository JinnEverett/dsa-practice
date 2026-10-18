// I12 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── helper: trie 26 chữ cái lưu PHẲNG ───
// Nút = một số nguyên; con của nút u theo chữ c là next[u * 26 + c] (0 = không có; nút 0 là gốc nên không bao giờ là con).
// Một Int32Array lớn thay vì hàng trăm nghìn object `{children: {...}}` → ít GC, cache-friendly.
class Pool26 {
  next = new Int32Array(26 * 256);
  size = 1; // nút 0 = gốc
  newNode(): number {
    if ((this.size + 1) * 26 > this.next.length) {
      const bigger = new Int32Array(this.next.length * 2);
      bigger.set(this.next);
      this.next = bigger;
    }
    return this.size++;
  }
  /** Con của u theo chữ c; tạo mới nếu chưa có. */
  child(u: number, c: number): number {
    let v = this.next[u * 26 + c];
    if (v === 0) {
      v = this.newNode();
      this.next[u * 26 + c] = v;
    }
    return v;
  }
}
const code = (s: string, i: number) => s.charCodeAt(i) - 97;

/**
 * ex01 · Trie
 * Ý tưởng: mỗi nút ứng với một tiền tố; cạnh gán nhãn là một chữ cái; cờ `end[u]` đánh dấu "có một từ kết thúc tại đây".
 *   insert: đi theo từng chữ, tạo nút thiếu. search: đi hết chữ và phải có `end`. startsWith: đi hết chữ là đủ.
 * Độ phức tạp: mỗi thao tác O(L) với L = độ dài từ — KHÔNG phụ thuộc số từ đã lưu. Bộ nhớ O(tổng độ dài).
 * Vì sao best practice: mảng phẳng Int32Array (26 con/nút) thay vì object/Map từng nút; dùng chung helper cho các bài sau.
 * Bẫy: `search("app")` khi chỉ insert "apple" là false (thiếu cờ end) còn `startsWith("app")` là true; quên `end` khi insert từ ngắn là tiền tố của từ dài.
 * Cách khác: node = `Map<string, Node>` (linh hoạt cho Unicode / bảng chữ cái lớn, tốn bộ nhớ hơn ~5–10×).
 * Python/Java: Python `dict` mỗi nút (`children = {}`) hoặc list 26; Java `TrieNode[26]` hoặc `HashMap<Character, TrieNode>`.
 */
export class Trie {
  private p = new Pool26();
  private end = new Uint8Array(256);
  insert(word: string): void {
    let u = 0;
    for (let i = 0; i < word.length; i++) u = this.p.child(u, code(word, i));
    if (u >= this.end.length) this.growEnd(u);
    this.end[u] = 1;
  }
  search(word: string): boolean {
    const u = this.walk(word);
    return u > 0 && u < this.end.length && this.end[u] === 1;
  }
  startsWith(prefix: string): boolean {
    return this.walk(prefix) >= 0;
  }
  /** Đi theo `s`; trả −1 nếu rơi khỏi trie. Chuỗi rỗng → gốc (0). */
  private walk(s: string): number {
    let u = 0;
    for (let i = 0; i < s.length; i++) {
      u = this.p.next[u * 26 + code(s, i)];
      if (u === 0) return -1;
    }
    return u;
  }
  private growEnd(need: number): void {
    let len = this.end.length;
    while (len <= need) len *= 2;
    const e = new Uint8Array(len);
    e.set(this.end);
    this.end = e;
  }
}

/**
 * ex02 · WordDictionary (wildcard '.')
 * Ý tưởng: trie như ex01; `search` gặp '.' thì thử MỌI con của nút hiện tại (DFS trên trie), gặp chữ thường thì đi theo con tương ứng.
 * Độ phức tạp: addWord O(L). search O(L) nếu không có '.'; tệ nhất O(26^d · L) với d = số dấu '.' (đề giới hạn d ≤ 3).
 * Vì sao best practice: không lưu từ trong danh sách rồi so khớp từng từ (O(số từ × L) mỗi truy vấn).
 * Bẫy: '.' khớp đúng MỘT ký tự (không phải 0 hoặc nhiều); kết thúc phải có cờ `end` (không chỉ "đã đi hết chữ").
 * Cách khác: nhóm từ theo độ dài + so từng từ cùng độ dài; trie theo bảng chữ cái rút gọn.
 * Python/Java: đệ quy sâu ≤ L ≤ 25 nên an toàn.
 */
export class WordDictionary {
  private p = new Pool26();
  private end = new Uint8Array(256);
  addWord(word: string): void {
    let u = 0;
    for (let i = 0; i < word.length; i++) u = this.p.child(u, code(word, i));
    while (u >= this.end.length) {
      const e = new Uint8Array(this.end.length * 2);
      e.set(this.end);
      this.end = e;
    }
    this.end[u] = 1;
  }
  search(word: string): boolean {
    const go = (u: number, i: number): boolean => {
      if (i === word.length) return u < this.end.length && this.end[u] === 1;
      if (word[i] === '.') {
        for (let c = 0; c < 26; c++) {
          const v = this.p.next[u * 26 + c];
          if (v !== 0 && go(v, i + 1)) return true;
        }
        return false;
      }
      const v = this.p.next[u * 26 + code(word, i)];
      return v !== 0 && go(v, i + 1);
    };
    return go(0, 0);
  }
}

/**
 * ex03 · findWords (Word Search II)
 * Ý tưởng: dựng trie từ TẤT CẢ từ cần tìm, rồi DFS từ mỗi ô trên bảng đi đồng thời trong trie: chỉ đi tiếp khi chữ ở ô là con của nút
 *   hiện tại. Gặp nút kết thúc từ thì ghi nhận và gỡ cờ (không báo trùng).
 * Độ phức tạp: O(R·C · 3^Lmax) tệ nhất nhưng cây tìm kiếm bị cắt bởi trie ngay khi tiền tố không khớp từ nào; không phụ thuộc số từ W
 *   (so với chạy `exist` từng từ: O(W · R·C · 3^L)).
 * Vì sao best practice: MỘT lần duyệt bảng cho mọi từ — đây là lý do kết hợp trie + backtracking.
 * Bẫy: báo cáo một từ nhiều lần (nhiều đường đi) — gỡ cờ khi tìm thấy; dùng lại ô trong cùng đường đi.
 * Cách khác: cắt tỉa nút lá sau khi tìm thấy từ để các lần DFS sau nhanh hơn.
 * Python/Java: ghi nhận bằng chuỗi lưu tại nút (`node.word`) thay vì dựng lại đường đi.
 */
export function findWords(board: string[], words: string[]): string[] {
  const R = board.length;
  const C = board[0].length;
  const p = new Pool26();
  let wordAt = new Int32Array(256).fill(-1);
  words.forEach((w, idx) => {
    let u = 0;
    for (let i = 0; i < w.length; i++) u = p.child(u, code(w, i));
    while (u >= wordAt.length) {
      const bigger = new Int32Array(wordAt.length * 2).fill(-1);
      bigger.set(wordAt);
      wordAt = bigger;
    }
    wordAt[u] = idx;
  });
  const found: string[] = [];
  const seen = new Uint8Array(R * C);
  const dfs = (r: number, c: number, parent: number) => {
    const u = p.next[parent * 26 + code(board[r], c)];
    if (u === 0) return;
    if (u < wordAt.length && wordAt[u] >= 0) {
      found.push(words[wordAt[u]]);
      wordAt[u] = -1;
    }
    seen[r * C + c] = 1;
    if (r > 0 && !seen[(r - 1) * C + c]) dfs(r - 1, c, u);
    if (r < R - 1 && !seen[(r + 1) * C + c]) dfs(r + 1, c, u);
    if (c > 0 && !seen[r * C + c - 1]) dfs(r, c - 1, u);
    if (c < C - 1 && !seen[r * C + c + 1]) dfs(r, c + 1, u);
    seen[r * C + c] = 0;
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) dfs(r, c, 0);
  return found;
}

/**
 * ex04 · replaceWords
 * Ý tưởng: trie các "gốc từ"; với mỗi từ trong câu đi theo trie tới khi gặp nút kết thúc (gốc ngắn nhất) → thay bằng tiền tố đó;
 *   không gặp thì giữ nguyên từ.
 * Độ phức tạp: O(tổng độ dài gốc + tổng độ dài câu).
 * Vì sao best practice: mỗi từ dừng NGAY khi gặp gốc ngắn nhất (không duyệt hết từ, không thử từng gốc).
 * Bẫy: thay bằng gốc DÀI hơn vì dừng muộn; từ ngắn hơn gốc; `split(' ')` đúng vì câu chỉ có một dấu cách giữa các từ.
 * Cách khác: băm mọi tiền tố của từ và thử từ ngắn đến dài (O(L²) mỗi từ).
 * Python/Java: `sentence.split(' ')` / `String.join(" ", ...)`.
 */
export function replaceWords(dictionary: string[], sentence: string): string {
  const p = new Pool26();
  let end = new Uint8Array(256);
  for (const w of dictionary) {
    let u = 0;
    for (let i = 0; i < w.length; i++) u = p.child(u, code(w, i));
    while (u >= end.length) {
      const e = new Uint8Array(end.length * 2);
      e.set(end);
      end = e;
    }
    end[u] = 1;
  }
  return sentence
    .split(' ')
    .map((word) => {
      let u = 0;
      for (let i = 0; i < word.length; i++) {
        u = p.next[u * 26 + code(word, i)];
        if (u === 0) return word;
        if (u < end.length && end[u]) return word.slice(0, i + 1);
      }
      return word;
    })
    .join(' ');
}

/**
 * ex05 · suggestedProducts
 * Ý tưởng: sắp xếp sản phẩm theo từ điển, chèn lần lượt vào trie; MỖI NÚT giữ tối đa 3 sản phẩm đầu tiên đi qua nó (vì chèn theo thứ tự đã sắp
 *   nên đó chính là 3 từ nhỏ nhất theo từ điển có tiền tố đó). Truy vấn: đi theo từng chữ của searchWord, lấy danh sách tại nút.
 * Độ phức tạp: sắp xếp O(P log P · L) + dựng trie O(tổng độ dài) + trả lời O(|searchWord|).
 * Vì sao best practice: "cache 3 đáp án tại nút" biến mỗi truy vấn tiền tố thành O(1); cùng ý tưởng với Autocomplete (ex07).
 * Bẫy: rơi khỏi trie thì mọi tiền tố dài hơn đều trả [] (không dừng vòng lặp sớm); sản phẩm trùng.
 * Cách khác: sắp xếp + binary search lower_bound cho mỗi tiền tố (đơn giản, O(L log P)).
 * Python/Java: Python `bisect`; Java `Arrays.sort` + `Collections.binarySearch`.
 */
export function suggestedProducts(products: string[], searchWord: string): string[][] {
  const sorted = products.slice().sort();
  const p = new Pool26();
  const top: string[][] = [[]];
  for (const w of sorted) {
    let u = 0;
    for (let i = 0; i < w.length; i++) {
      u = p.child(u, code(w, i));
      while (u >= top.length) top.push([]);
      if (top[u].length < 3) top[u].push(w);
    }
  }
  const out: string[][] = [];
  let u = 0;
  for (let i = 0; i < searchWord.length; i++) {
    if (u !== -1) {
      const v = p.next[u * 26 + code(searchWord, i)];
      u = v === 0 ? -1 : v;
    }
    out.push(u === -1 ? [] : top[u].slice());
  }
  return out;
}

/**
 * ex06 · findMaximumXOR
 * Ý tưởng: trie NHỊ PHÂN trên 31 bit (từ bit cao xuống). Với mỗi số x, đi trong trie ưu tiên nhánh có bit NGƯỢC với bit của x (để XOR có bit 1
 *   ở vị trí cao nhất có thể); nếu không có thì đi nhánh còn lại. XOR lớn nhất = max qua mọi x.
 * Độ phức tạp: O(31 · n) thời gian, O(31 · n) bộ nhớ nút.
 * Vì sao best practice: XOR lớn nhất ưu tiên bit cao ⇒ tham lam từng bit là đúng; tránh O(n²) cặp.
 * Bẫy: Java/JS `1 << 31` là số âm — đi từ bit 30 xuống 0 vì nums ≤ 2³¹ − 1; `(x >> b) & 1` thay vì `>>>`.
 * Cách khác: tập hợp tiền tố + kiểm tra giả định bit (O(31 · n) không cần trie).
 * Python/Java: Java `int[][] child` hoặc hai `int[]` song song; Python dùng list phẳng.
 */
export function findMaximumXOR(nums: number[]): number {
  const maxNodes = nums.length * 31 + 2;
  const child = new Int32Array(maxNodes * 2); // child[u*2 + bit]; 0 = không có
  let size = 1;
  for (const x of nums) {
    let u = 0;
    for (let b = 30; b >= 0; b--) {
      const bit = (x >> b) & 1;
      if (child[u * 2 + bit] === 0) child[u * 2 + bit] = size++;
      u = child[u * 2 + bit];
    }
  }
  let best = 0;
  for (const x of nums) {
    let u = 0;
    let cur = 0;
    for (let b = 30; b >= 0; b--) {
      const bit = (x >> b) & 1;
      const want = child[u * 2 + (bit ^ 1)];
      if (want !== 0) {
        cur |= 1 << b;
        u = want;
      } else u = child[u * 2 + bit];
    }
    if (cur > best) best = cur;
  }
  return best;
}

/**
 * ex07 · Autocomplete (top 3 theo lượt)
 * Ý tưởng: trie; MỖI NÚT cache danh sách ≤ 3 id từ tốt nhất (lượt giảm dần, hòa → từ điển tăng dần) trong số các từ đi qua nút đó.
 *   `add(word)`: tăng lượt, rồi dọc đường đi của từ cập nhật danh sách của từng nút (bỏ id cũ nếu có, chèn lại đúng chỗ, cắt còn 3).
 *   `top3(prefix)`: đi theo prefix, trả danh sách đã cache — O(|prefix|).
 * Độ phức tạp: add O(L · 3), top3 O(L). Bộ nhớ O(tổng độ dài + 3 · số nút).
 * Vì sao best practice: không duyệt cả cây con mỗi lần hỏi (O(số từ có tiền tố)); lượt chỉ TĂNG nên một từ ngoài top3 chỉ có thể vào, không phải xét lại cả cây.
 * Bẫy: so sánh hòa phải theo chữ cái; từ mới (chưa có) có lượt 1; phải cập nhật MỌI nút trên đường đi (kể cả gốc nếu hỗ trợ tiền tố rỗng).
 * Cách khác: heap lười cho mỗi nút (phức tạp hơn); duyệt cây con + heap size 3 (chậm khi tiền tố ngắn).
 * Python/Java: hai danh sách song song (`words`, `counts`) + `dict` word → id.
 */
export class Autocomplete {
  private p = new Pool26();
  private top: number[][] = [[]];
  private words: string[] = [];
  private counts: number[] = [];
  private id = new Map<string, number>();
  constructor(words: string[], counts: number[]) {
    words.forEach((w, i) => {
      const k = this.words.length;
      this.words.push(w);
      this.counts.push(counts[i]);
      this.id.set(w, k);
      this.touch(k);
    });
  }
  add(word: string): void {
    let k = this.id.get(word);
    if (k === undefined) {
      k = this.words.length;
      this.words.push(word);
      this.counts.push(0);
      this.id.set(word, k);
    }
    this.counts[k]++;
    this.touch(k);
  }
  top3(prefix: string): string[] {
    let u = 0;
    for (let i = 0; i < prefix.length; i++) {
      u = this.p.next[u * 26 + code(prefix, i)];
      if (u === 0) return [];
    }
    return (this.top[u] ?? []).map((k) => this.words[k]);
  }
  /** a đứng trước b trong thứ hạng? lượt giảm dần, hòa → từ điển tăng dần. */
  private better(a: number, b: number): boolean {
    return this.counts[a] !== this.counts[b] ? this.counts[a] > this.counts[b] : this.words[a] < this.words[b];
  }
  /** Cập nhật danh sách top-3 của mọi nút trên đường đi của từ k (kể cả gốc). */
  private touch(k: number): void {
    const w = this.words[k];
    let u = 0;
    for (let i = 0; i <= w.length; i++) {
      if (i > 0) u = this.p.child(u, code(w, i - 1));
      while (u >= this.top.length) this.top.push([]);
      const list = this.top[u];
      const at = list.indexOf(k);
      if (at >= 0) list.splice(at, 1);
      let pos = 0;
      while (pos < list.length && this.better(list[pos], k)) pos++;
      list.splice(pos, 0, k);
      if (list.length > 3) list.length = 3;
    }
  }
}

/**
 * ex08 · StreamChecker
 * Ý tưởng: câu hỏi là "SUFFIX của luồng có là một từ cấm không?" — đảo ngược mọi từ cấm rồi dựng trie. Mỗi lần có chữ mới, đọc luồng
 *   NGƯỢC từ chữ mới nhất, đi trong trie; gặp nút kết thúc ⇒ true; rơi khỏi trie hoặc quá độ dài từ dài nhất ⇒ false.
 * Độ phức tạp: query O(Lmax); bộ nhớ O(tổng độ dài từ + độ dài luồng).
 * Vì sao best practice: tránh so sánh `endsWith` với từng từ cấm (O(W · L) mỗi lần) — trie duyệt cùng lúc mọi từ cấm.
 * Bẫy: dựng trie xuôi (không đảo) → sai; quên giới hạn Lmax (đọc ngược cả luồng dài).
 * Cách khác: Aho–Corasick (A09) cho O(1) mỗi chữ.
 * Python/Java: `char` ↔ chuỗi 1 ký tự; Java `letter - 'a'`; lưu luồng bằng list/`StringBuilder`.
 */
export class StreamChecker {
  private p = new Pool26();
  private end = new Uint8Array(256);
  private maxLen = 0;
  private stream: number[] = [];
  constructor(words: string[]) {
    for (const w of words) {
      let u = 0;
      for (let i = w.length - 1; i >= 0; i--) u = this.p.child(u, code(w, i));
      while (u >= this.end.length) {
        const e = new Uint8Array(this.end.length * 2);
        e.set(this.end);
        this.end = e;
      }
      this.end[u] = 1;
      if (w.length > this.maxLen) this.maxLen = w.length;
    }
  }
  query(letter: string): boolean {
    const s = this.stream;
    s.push(letter.charCodeAt(0) - 97);
    let u = 0;
    for (let i = s.length - 1, steps = 0; i >= 0 && steps < this.maxLen; i--, steps++) {
      u = this.p.next[u * 26 + s[i]];
      if (u === 0) return false;
      if (u < this.end.length && this.end[u]) return true;
    }
    return false;
  }
}
