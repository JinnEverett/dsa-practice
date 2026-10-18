// F11 · Đáp án best practice. Chỉ mở sau khi check ✅.
import { ListNode } from '../../tools/lib.ts';

// ─── ex01 · Đảo ngược danh sách ───
// Ý tưởng: 3 con trỏ prev / cur / next; lưu next trước khi đổi cur.next.
// Độ phức tạp: O(n) time · O(1) space.
// Cách khác: đệ quy (reverse(head.next) rồi head.next.next = head) — đẹp nhưng O(n) stack → tràn ở n = 10⁵.
export function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let cur = head;
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}

// ─── ex02 · Node giữa ───
// Ý tưởng: slow 1 bước, fast 2 bước; khi fast hết đường, slow ở giữa (node giữa thứ hai khi n chẵn).
// Độ phức tạp: O(n) time · O(1) space, một lượt.
export function middleNode(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}

// ─── ex03 · Có chu trình không? ───
// Ý tưởng: Floyd — có vòng thì fast (2 bước) đuổi kịp slow (1 bước) bên trong vòng, mỗi vòng lặp khoảng cách giảm 1.
// Độ phức tạp: O(n) time · O(1) space.
// Cách khác: Set các node đã thăm — O(n) bộ nhớ, dễ hiểu.
export function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// ─── ex04 · Trộn hai danh sách đã sort ───
// Ý tưởng: dummy head + con trỏ tail; nối node nhỏ hơn; hết một bên thì nối nguyên phần còn lại của bên kia.
// Độ phức tạp: O(n + m) time · O(1) space (dùng lại node có sẵn).
export function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode();
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 ?? l2;
  return dummy.next;
}

// ─── ex05 · Xóa node thứ n từ cuối ───
// Ý tưởng: dummy → head. fast đi trước n bước, rồi fast và slow cùng đi tới khi fast ở node cuối; slow đứng NGAY TRƯỚC node cần xóa.
// Độ phức tạp: O(L) time một lượt · O(1) space.
// Vì sao dummy: khi xóa chính head (n = độ dài), slow là dummy → không cần if riêng.
export function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let fast: ListNode = dummy;
  let slow: ListNode = dummy;
  for (let i = 0; i < n; i++) fast = fast.next!;
  while (fast.next) {
    fast = fast.next;
    slow = slow.next!;
  }
  slow.next = slow.next!.next;
  return dummy.next;
}

// ─── ex06 · Danh sách đối xứng ───
// Ý tưởng: tìm giữa (fast/slow) → đảo nửa sau → so hai nửa → (lịch sự) đảo lại để trả danh sách nguyên trạng.
// Độ phức tạp: O(n) time · O(1) space.
// Cách khác: chép ra mảng rồi two pointers — O(n) bộ nhớ, rất dễ viết.
export function isPalindromeList(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  const secondHead = reverseList(slow);
  let a = head;
  let b = secondHead;
  let ok = true;
  while (b) {
    if (a!.val !== b.val) {
      ok = false;
      break;
    }
    a = a!.next;
    b = b.next;
  }
  reverseList(secondHead); // khôi phục input
  return ok;
}

// ─── ex07 · Điểm bắt đầu chu trình ───
// Ý tưởng: Floyd pha 1 tìm điểm gặp; pha 2 đặt p = head, cùng đi 1 bước với slow — gặp nhau tại đầu vòng.
//   Chứng minh: gọi a = head→đầu vòng, b = đầu vòng→điểm gặp, c = độ dài vòng. Lúc gặp: 2(a + b) = a + b + kc ⇒ a = kc − b,
//   tức đi a bước từ điểm gặp là về đúng đầu vòng.
// Độ phức tạp: O(n) time · O(1) space. Đếm chỉ số khi đi từ head.
export function detectCycleStart(head: ListNode | null): number {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      let idx = 0;
      while (p !== slow) {
        p = p!.next;
        slow = slow!.next;
        idx++;
      }
      return idx;
    }
  }
  return -1;
}

// ─── ex08 · Cộng hai số dạng danh sách ───
// Ý tưởng: cộng như tiểu học, chữ số thấp nằm ở đầu nên duyệt xuôi luôn; nhớ carry; vòng lặp chạy khi còn l1, l2 hoặc carry.
// Độ phức tạp: O(max(n, m)) time · O(max(n, m)) cho kết quả.
// Bẫy: chuyển cả danh sách thành số rồi cộng → tràn (10⁵ chữ số).
export function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode();
  let tail = dummy;
  let carry = 0;
  while (l1 || l2 || carry) {
    const sum = (l1?.val ?? 0) + (l2?.val ?? 0) + carry;
    carry = sum >= 10 ? 1 : 0;
    tail.next = new ListNode(sum % 10);
    tail = tail.next;
    l1 = l1?.next ?? null;
    l2 = l2?.next ?? null;
  }
  return dummy.next;
}

// ─── ex09 · Gộp k danh sách ───
// Ý tưởng: chia để trị theo cặp (giống merge sort bottom-up): mỗi vòng trộn cặp danh sách (0,1), (2,3)…, số danh sách giảm một nửa.
//   Mỗi vòng xử lý tổng N node → log k vòng → O(N log k).
// Độ phức tạp: O(N log k) time · O(k) cho mảng con trỏ (trộn tại chỗ, không tạo node mới).
// Bẫy: trộn dồn vào một danh sách kết quả từng cái một → O(N·k).
// Cách khác: min-heap k phần tử (I04) — cũng O(N log k), là cách hay gặp nhất khi danh sách là stream.
export function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  if (lists.length === 0) return null;
  let cur = lists.slice();
  while (cur.length > 1) {
    const next: (ListNode | null)[] = [];
    for (let i = 0; i < cur.length; i += 2) next.push(i + 1 < cur.length ? mergeTwoLists(cur[i], cur[i + 1]) : cur[i]);
    cur = next;
  }
  return cur[0];
}

// ─── ex10 · Lịch sử trình duyệt ───
// Ý tưởng: doubly linked list; con trỏ cur trỏ trang hiện tại. visit: tạo node mới sau cur, cắt bỏ phần forward cũ
//   (chỉ cần gán cur.next = node mới — phần cũ không còn ai trỏ tới, GC sẽ thu). back/forward: đi prev/next tối đa steps.
// Độ phức tạp: visit O(1) · back/forward O(steps).
// Cách khác (gọn hơn trong thực tế): mảng + chỉ số cur + biến `last` (vị trí cuối hợp lệ) → back/forward O(1):
//   visit: history[++cur] = url; last = cur. back: cur = max(0, cur − steps). forward: cur = min(last, cur + steps).
// Python/Java: Python không có private; Java dùng class Node lồng (static nested class) với prev/next.
class PageNode {
  url: string;
  prev: PageNode | null = null;
  next: PageNode | null = null;
  constructor(url: string) {
    this.url = url;
  }
}
export class BrowserHistory {
  private cur: PageNode;
  constructor(homepage: string) {
    this.cur = new PageNode(homepage);
  }
  visit(url: string): void {
    const node = new PageNode(url);
    node.prev = this.cur;
    this.cur.next = node; // bỏ lịch sử forward cũ
    this.cur = node;
  }
  back(steps: number): string {
    while (steps-- > 0 && this.cur.prev) this.cur = this.cur.prev;
    return this.cur.url;
  }
  forward(steps: number): string {
    while (steps-- > 0 && this.cur.next) this.cur = this.cur.next;
    return this.cur.url;
  }
}
