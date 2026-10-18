// D10 · Đáp án best practice. Chỉ mở sau khi check ✅.

// ─── ex01 · TextEditor ───
// Ý tưởng: hai stack ký tự quanh con trỏ: `left` = các ký tự TRƯỚC con trỏ (đỉnh = ký tự sát con trỏ), `right` = các ký tự SAU con trỏ, lưu NGƯỢC (đỉnh = ký tự ngay sau con trỏ).
//   addText: push từng ký tự vào left. deleteText(k): pop tối đa k lần từ left. cursorLeft(k): chuyển tối đa k ký tự từ đỉnh left sang đỉnh right; cursorRight(k) ngược lại.
//   Kết quả của cursor*: 10 ký tự cuối của left (hoặc ít hơn).
// Đây là biến thể "gap buffer" với hai mảng riêng; gap buffer thật dùng MỘT mảng có khoảng trống ở vị trí con trỏ để không phải cấp phát riêng (Emacs).
// Bất biến: văn bản = left (từ đáy lên đỉnh) rồi right (từ đỉnh xuống đáy); con trỏ nằm giữa hai stack; |left| + |right| = độ dài văn bản.
// Độ phức tạp: addText O(|text|) · deleteText O(k) · cursorLeft/Right O(k + 10) — chi phí tỉ lệ với số ký tự bị chuyển, không phụ thuộc độ dài văn bản · space O(n).
// Vì sao best practice: mọi thao tác chỉ chạm quanh con trỏ; không bao giờ cắt/ghép chuỗi dài (cách `text.slice(0, i) + s + text.slice(i)` là O(n) mỗi lần).
// Bẫy: ghép chuỗi mỗi thao tác (O(n)); quên `min(k, độ dài)`; trả 10 ký tự đầu thay vì 10 ký tự CUỐI trước con trỏ; thứ tự ký tự sai khi chuyển giữa hai stack (đảo ngược hai lần).
// Cách khác: rope / cây cân bằng cho văn bản rất lớn và chèn ở vị trí tùy ý (O(log n)); piece table (VS Code) cho văn bản lớn có undo rẻ; danh sách liên kết đôi các ký tự.
// Python/Java: Python `list` làm stack; Java `ArrayDeque<Character>` hoặc `StringBuilder` cho left, `char[]` cho right.
export class TextEditor {
  private left: string[] = [];
  private right: string[] = [];

  addText(text: string): void {
    for (let i = 0; i < text.length; i++) this.left.push(text[i]);
  }
  deleteText(k: number): number {
    const n = Math.min(k, this.left.length);
    this.left.length -= n;
    return n;
  }
  cursorLeft(k: number): string {
    for (let n = Math.min(k, this.left.length); n > 0; n--) this.right.push(this.left.pop()!);
    return this.tail();
  }
  cursorRight(k: number): string {
    for (let n = Math.min(k, this.right.length); n > 0; n--) this.left.push(this.right.pop()!);
    return this.tail();
  }
  private tail(): string {
    return this.left.slice(Math.max(0, this.left.length - 10)).join('');
  }
}

// ─── ex02 · UndoRedo ───
// Ý tưởng: MẪU COMMAND. Mỗi lệnh đã áp dụng được lưu cùng đủ thông tin để ĐẢO NGƯỢC:
//   "+text": undo = bỏ `text.length` ký tự cuối; "-k": lưu chuỗi đã xóa `removed`, undo = thêm lại `removed`.
//   Hai stack: `done` (có thể undo) và `undone` (có thể redo). apply: thực hiện, push vào done, XÓA undone (nhánh lịch sử cũ không còn đúng).
//   undo: pop done → đảo ngược → push undone. redo: pop undone → thực hiện lại → push done.
//   Giới hạn lịch sử: nếu |done| > maxHistory thì bỏ lệnh CŨ NHẤT (đầu done). Dùng mảng + chỉ số `head` thay vì `shift()` để bỏ phần đầu O(1).
// Văn bản giữ ở dạng stack ký tự (như left của TextEditor) để "xóa k ký tự cuối" là O(k) và state() ghép chuỗi theo yêu cầu.
// Bất biến: áp dụng lần lượt `done[head..]` lên văn bản rỗng cho ra đúng văn bản hiện tại (khi chưa có lệnh bị bỏ); |done| − head ≤ maxHistory; undone chỉ chứa lệnh đã undo MÀ chưa bị apply mới xóa.
// Độ phức tạp: apply/undo/redo O(|text| hoặc k) · state() O(độ dài văn bản) · bộ nhớ lịch sử O(maxHistory · kích thước lệnh).
// Bẫy: không xóa redo khi apply mới (redo ra nội dung sai); lưu "-k" mà không lưu phần đã xóa (không đảo được); k > độ dài ⇒ chỉ xóa phần có thật (lưu `removed` thật, không phải k);
//   dùng `shift()` để bỏ lệnh cũ (O(n)); tính state bằng cách chạy lại TOÀN BỘ lịch sử mỗi lần gọi state() (O(lịch sử)).
// Cách khác: memento — lưu ảnh chụp toàn bộ trạng thái mỗi lệnh (đơn giản, tốn bộ nhớ O(độ dài) mỗi lệnh; ổn khi dữ liệu nhỏ hoặc cấu trúc bất biến chia sẻ phần chung);
//   persistent data structure (rope/piece table bất biến) cho undo O(1) với văn bản lớn.
// Python/Java: Python `deque(maxlen=...)` tự bỏ phần cũ nhất; Java `ArrayDeque` + `pollFirst()`.
interface Cmd {
  add: boolean; // true: "+text"; false: "-k"
  text: string; // add: chuỗi thêm; remove: chuỗi THỰC SỰ đã xóa
}
export class UndoRedo {
  private max: number;
  private doc: string[] = [];
  private done: Cmd[] = [];
  private head = 0;
  private undone: Cmd[] = [];

  constructor(maxHistory: number) {
    this.max = maxHistory;
  }
  apply(op: string): void {
    let cmd: Cmd;
    if (op[0] === '+') {
      cmd = { add: true, text: op.slice(1) };
      this.append(cmd.text);
    } else {
      const k = Number(op.slice(1));
      const n = Math.min(k, this.doc.length);
      cmd = { add: false, text: this.doc.splice(this.doc.length - n, n).join('') };
    }
    this.done.push(cmd);
    if (this.done.length - this.head > this.max) {
      this.done[this.head++] = undefined as any; // thả tham chiếu để GC
      if (this.head > 1024 && this.head * 2 > this.done.length) {
        this.done.splice(0, this.head);
        this.head = 0;
      }
    }
    this.undone.length = 0;
  }
  undo(): boolean {
    if (this.done.length - this.head === 0) return false;
    const cmd = this.done.pop()!;
    if (cmd.add) this.doc.length -= cmd.text.length;
    else this.append(cmd.text);
    this.undone.push(cmd);
    return true;
  }
  redo(): boolean {
    const cmd = this.undone.pop();
    if (!cmd) return false;
    if (cmd.add) this.append(cmd.text);
    else this.doc.length -= cmd.text.length;
    this.done.push(cmd);
    return true;
  }
  state(): string {
    return this.doc.join('');
  }
  private append(s: string): void {
    for (let i = 0; i < s.length; i++) this.doc.push(s[i]);
  }
}
