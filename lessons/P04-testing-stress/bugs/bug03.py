# Bug 03 · phần tử nhỏ thứ k. Code CÓ LỖI — tương đương Python của "sort() mặc định so chuỗi":
# dữ liệu đến dưới dạng chuỗi số và được sắp như chuỗi.
def kth_smallest(nums: list[int], k: int) -> int:
    a = sorted(str(x) for x in nums)
    return int(a[k - 1])
