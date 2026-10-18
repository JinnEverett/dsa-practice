/** Node của singly linked list — giống định nghĩa trên LeetCode. */
public class ListNode {
    public int val;
    public ListNode next;

    public ListNode() {}

    public ListNode(int val) { this.val = val; }

    public ListNode(int val, ListNode next) {
        this.val = val;
        this.next = next;
    }

    @Override
    public String toString() {
        StringBuilder b = new StringBuilder("[");
        int guard = 0;
        for (ListNode cur = this; cur != null && guard < 1000; cur = cur.next, guard++) {
            if (guard > 0) b.append(", ");
            b.append(cur.val);
        }
        return b.append("]").toString();
    }
}
