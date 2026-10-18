# P02 · Bài tập (3 bài, luyện khung phỏng vấn)

Tạo khung: `node tools/scaffold.ts lessons/P02-interview-framework [--lang ts|py|java]` · Chấm: `node tools/check.ts lessons/P02-interview-framework 01`

**Pass:** 3/3 bài qua `check` **và** rubric mock ≥ 3/4 mỗi trục (chạy `/dsa-mock` sau khi làm xong).

**Quy trình mỗi bài:** theo khung 7 bước trong README — *trước khi code*, nói (hoặc viết ra file nháp) bước 1–4: câu hỏi làm rõ đề, ví dụ, brute + Big-O, ý tưởng tối ưu + bất biến. Sau khi code: dry-run bằng tay (bước 6), rồi mới `check`. Cuối cùng nêu phân tích (bước 7) cho coach.

> Đề cố ý để một số chi tiết ở dạng **hỏi lại được** (ví dụ "chạm nhau" có tính chồng không?). Câu trả lời nằm ở phần *Quy ước* dưới mỗi đề — hãy hỏi trước khi đọc.

---

## ex01 · 🟡 Đoạn request liên tiếp dài nhất không trùng id
Hệ thống gateway ghi lại dãy `requestIds` theo thứ tự đến. Tìm độ dài đoạn **liên tiếp** dài nhất mà không có hai request cùng id.
```java
int longestDistinctRun(String[] requestIds)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, id ASCII ≤ 20 ký tự, phân biệt hoa/thường.
- Ví dụ: `[a,b,a,c]` → `3` · `[x,x,x]` → `1` · `[]` → `0` · `[a,b,b,a]` → `2`. (≈ LeetCode 3)
- *Quy ước:* mảng rỗng → `0`; trả độ dài, không trả đoạn.

## ex02 · 🟡 Gộp khung giờ bảo trì
Team vận hành nhập các khung bảo trì `[start, end]` (đóng, đơn vị phút kể từ nửa đêm của một ngày làm mốc, **không sắp xếp**). Gộp các khung **chồng nhau hoặc chạm nhau** thành các khung rời nhau, sắp theo `start`.
```java
int[][] mergeMaintenanceWindows(int[][] windows)
```
- Ràng buộc: `0 ≤ n ≤ 10⁵`, `0 ≤ start ≤ end ≤ 10⁹`. Không được thay đổi mảng đầu vào ngoài ý muốn.
- Ví dụ: `[[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]` · `[[1,4],[4,5]]` → `[[1,5]]` · `[[1,4],[2,3]]` → `[[1,4]]`. (≈ LeetCode 56)
- *Quy ước:* chạm nhau tại một điểm cũng gộp; khung độ dài 0 hợp lệ.

## ex03 · 🔴 Đếm cụm máy chủ liền kề trong rack
Sơ đồ rack là lưới ký tự: `'#'` = có máy chủ, `'.'` = ô trống. Một **cụm** là tập các ô `'#'` kề nhau theo 4 hướng (trên, dưới, trái, phải — **không** tính chéo). Đếm số cụm — để biết cần bao nhiêu lần cấp nguồn riêng.
```java
int countClusters(String[] grid)
```
- Ràng buộc: tổng số ô `≤ 10⁵`; mọi dòng cùng độ dài; lưới có thể rỗng.
- Ví dụ: `["##..", "#...", "..#."]` → `2` · `["###","###"]` → `1` · `["#.", ".#"]` → `2` · `[]` → `0`. (≈ LeetCode 200)
- *Quy ước:* test lớn có **một cụm duy nhất ≈ 10⁵ ô**. Hãy cân nhắc giới hạn độ sâu đệ quy của ngôn ngữ bạn chọn (bước 3 của khung: nói rõ rủi ro trước khi code).
- **Câu hỏi quy mô:** cụm lớn nhất bạn xử lý được trước khi bản đệ quy (nếu bạn viết) tràn stack là bao nhiêu ô? Thử `n = 10³, 10⁴, 10⁵` bằng `bench`.
