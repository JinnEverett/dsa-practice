# Bug 05 · tích theo mod. Python có số nguyên lớn tùy ý nên bản này ĐÚNG — dùng để so sánh với TS/Java.
def product_mod(nums: list[int], mod: int) -> int:
    p = 1
    for x in nums:
        p = (p * x) % mod
    return p
