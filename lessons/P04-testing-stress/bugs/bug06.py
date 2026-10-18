# Bug 06 · giá trị lớn thứ hai (khác nhau); -1 nếu không có. Code CÓ LỖI.
def second_largest(nums: list[int]) -> int:
    nums.sort(reverse=True)
    for x in nums:
        if x != nums[0]:
            return x
    return -1
