# Bug 02 · sắp từ theo tần suất. Code CÓ LỖI.
def sort_by_frequency(words: list[str]) -> list[str]:
    cnt: dict[str, int] = {}
    for w in words:
        cnt[w] = cnt.get(w, 0) + 1
    return sorted(cnt, key=lambda w: -cnt[w])
