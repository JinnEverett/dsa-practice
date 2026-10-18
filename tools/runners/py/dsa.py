"""Cấu trúc dữ liệu dùng chung cho bài làm Python: from dsa import ListNode, TreeNode"""
from __future__ import annotations

from collections import deque


class ListNode:
    def __init__(self, val: int = 0, next: ListNode | None = None):
        self.val = val
        self.next = next

    def __repr__(self) -> str:
        return f"ListNode({list_to_array(self)})"


class TreeNode:
    def __init__(self, val: int = 0, left: TreeNode | None = None, right: TreeNode | None = None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self) -> str:
        return f"TreeNode({tree_to_array(self)})"


def build_list(arr: list[int]) -> ListNode | None:
    dummy = ListNode()
    tail = dummy
    for v in arr:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next


def build_cycle_list(arr: list[int], pos: int) -> ListNode | None:
    head = build_list(arr)
    if pos < 0 or head is None:
        return head
    tail, target, i = head, None, 0
    while True:
        if i == pos:
            target = tail
        if tail.next is None:
            break
        tail = tail.next
        i += 1
    tail.next = target
    return head


def list_to_array(head: ListNode | None) -> list[int]:
    out: list[int] = []
    while head is not None:
        out.append(head.val)
        if len(out) > 10_000_000:
            raise ValueError("list có chu trình hoặc dài hơn 10^7 node")
        head = head.next
    return out


def build_tree(arr: list[int | None]) -> TreeNode | None:
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    q = deque([root])
    i = 1
    while i < len(arr):
        node = q.popleft()
        if arr[i] is not None:
            node.left = TreeNode(arr[i])
            q.append(node.left)
        i += 1
        if i >= len(arr):
            break
        if arr[i] is not None:
            node.right = TreeNode(arr[i])
            q.append(node.right)
        i += 1
    return root


def tree_to_array(root: TreeNode | None) -> list[int | None]:
    if root is None:
        return []
    out: list[int | None] = []
    q: deque[TreeNode | None] = deque([root])
    while q:
        node = q.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        q.append(node.left)
        q.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def print_tree(root: TreeNode | None) -> str:
    """In cây nằm ngang để debug: print(print_tree(root))"""
    lines: list[str] = []

    def walk(node: TreeNode | None, prefix: str, is_left: bool, is_root: bool) -> None:
        if node is None:
            return
        walk(node.right, prefix + ("" if is_root else ("│   " if is_left else "    ")), False, False)
        lines.append(prefix + ("" if is_root else ("└── " if is_left else "┌── ")) + str(node.val))
        walk(node.left, prefix + ("" if is_root else ("    " if is_left else "│   ")), True, False)

    walk(root, "", False, True)
    return "\n".join(lines)
