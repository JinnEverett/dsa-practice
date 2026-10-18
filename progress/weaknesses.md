# Weaknesses

Lỗi lặp lại, do `/dsa-review`, `/dsa-lesson`, `/dsa-case` và `/dsa-mock` ghi lại. `/dsa-drill` lấy câu hỏi ôn từ đây.

Quy ước: mỗi lỗi một dòng, có tag khái niệm. `count` tăng thêm mỗi lần lỗi tái diễn. Khi drill trả lời đúng 3 lần liên tiếp thì chuyển dòng đó xuống mục "Đã khắc phục".

Tag gợi ý (tái sử dụng trước khi tạo tag mới): `doc-thieu-de`, `bo-sot-rang-buoc`, `off-by-one`, `edge-rong`, `vong-lap-an` (O(n) ẩn trong `includes`/`shift`/`slice`), `sort-mac-dinh` (`sort()` so chuỗi), `tran-so-js` (> 2⁵³, int32 của bitwise), `stack-overflow`, `mutate-input`, `bat-bien-binary-search`, `dp-state-sai`, `dp-thu-tu-duyet`, `greedy-khong-chung-minh`, `visited-sai-cho`, `big-o-sai`, `quen-tie-break`.

## Đang theo dõi

| Tag | Mô tả lỗi | Module | count | Lần cuối | Streak đúng |
|---|---|---|---|---|---|

## Đã khắc phục

| Tag | Mô tả lỗi | Ngày khắc phục |
|---|---|---|
