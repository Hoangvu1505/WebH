# 📋 TEACHER QUICK RUN SHEET — BUZZ TO APPLY!
### Kịch Bản Tổ Chức Hoạt Động Tuyển Tình Nguyện Viên (Grade 10 English Activity)

---

## ⏰ 1. Chuẩn Bị Trước Tiết Học (5 Phút)

1. **Khởi động hệ thống**:
   - Mở laptop kết nối với máy chiếu lớp học.
   - Mở trình duyệt truy cập: `http://localhost:4000/#teacher` (hoặc đường link trực tuyến khi đã deploy).
   - Nhập mã PIN bảo mật: **`3568`** để mở khóa **Teacher Dashboard**.
2. **Chiếu mã QR lên bảng**:
   - Màn hình Teacher Dashboard tự động hiển thị mã **QR Code** to và sắc nét ở góc dưới.
   - Bật máy chiếu lên bảng để cả lớp nhìn rõ.
3. **Phân công cặp học sinh**:
   - Chia 40 học sinh trong lớp thành **20 cặp** (từ **P01 đến P20**).
   - Yêu cầu: *Mỗi cặp chỉ dùng 1 chiếc điện thoại thông minh đại diện*.

---

## 🎬 2. Kịch Bản Vận Hành Trong Tiết Học (6 Bước Thực Chiến)

| Bước | Thời Gian | Hành Động Của Giáo Viên | Màn Hình Học Sinh | Lời Thoại Gợi Ý (English) |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | 2 phút | Yêu cầu học sinh quét mã QR và chọn mã cặp (Pair ID) của mình. | Hiển thị màn hình chọn: `P01` đến `P20`. | *"Volunteers, take out one phone per pair and scan the QR code on the board. Select your assigned Pair ID!"* |
| **B2** | 1 phút | Giáo viên nhìn vào ô **PAIRS JOINED ROOM** trên bảng điều khiển để kiểm tra xem đã đủ **20/20 cặp** vào phòng chờ chưa. | Màn hình chờ: **YOU'RE IN!** (*Waiting for the teacher to start...*). Nút APPLY bị khóa. | *"Make sure you see 'YOU'RE IN!' on your phone. Don't close the browser!"* |
| **B3** | 10 giây | Giáo viên giới thiệu nhanh 3 vai trò và đếm ngược: *"3... 2... 1... START!"* và bấm nút **▶ START**. | Đồng hồ đếm ngược 90s bắt đầu chạy, nhạc nền/tiếng còi vang lên, 3 thẻ role mở quyền bấm: **READY? GO!**. | *"Ready? GO! Buzz to grab your dream team spot now! First come, first served!"* |
| **B4** | 30–60s | Học sinh bấm tranh suất. Giáo viên theo dõi 3 cột trên máy chiếu cập nhật số lượng realtime. | Ai bấm trước: **REGISTRATION SUCCESSFUL!** (pháo hoa). Ai chậm hơn bị role đầy: **OOPS! THIS TEAM IS FULL!** (chọn team khác). | *"Keep going! Welcome Team is filling up fast! 2 slots left in Media Team!"* |
| **B5** | Khi còn 10s | Hệ thống phát âm thanh tích tắc cảnh báo, đồng hồ đổi màu đỏ. Hết 90s hoặc đủ 20 cặp: hệ thống tự động **CLOSED**. | Màn hình thông báo **RECRUITMENT COMPLETED!** hoặc **REGISTRATION CLOSED!**. | *"10 seconds remaining! Last chance to secure your spots!"* |
| **B6** | 1 phút | Giáo viên nhìn vào danh sách kết quả cuối cùng trên máy chiếu để tổng kết. | Hiển thị kết quả đã giành được của từng cặp. | *"Awesome job! All 20 pairs have secured their volunteer positions. Let's move to our next mission!"* |

---

## 🛠️ 3. Xử Lý Tình Huống Sự Cố Thường Gặp

| Tình Huống | Nguyên Nhân | Cách Xử Lý Nhanh Ngay Trên Dashboard |
| :--- | :--- | :--- |
| **Học sinh bị mất mạng hoặc bấm F5** | Rớt 4G/WiFi | Học sinh chỉ cần mở lại web, kết quả đã đăng ký vẫn được lưu nguyên vẹn 100%. |
| **Học sinh chọn nhầm Pair ID của cặp khác** | Bấm nhầm nút | Học sinh bấm nút **"↔ Change Pair ID"** ở dưới cùng màn hình để chọn lại mã đúng. |
| **Học sinh chọn nhầm Role và muốn xin đổi** | Đổi ý hoặc bấm nhầm | Giáo viên vào mục **Troubleshooting**: chọn Pair $\rightarrow$ chọn Role mới $\rightarrow$ bấm **Assign/Reassign** (Hệ thống vẫn giữ đúng hạn mức 7-7-6). |
| **Cặp học sinh không kịp bấm do điện thoại hết pin** | Sự cố thiết bị | Giáo viên gán thủ công cặp đó vào vai trò còn trống bằng form **Manual Assignment** trên bảng điều khiển. |
| **Giáo viên muốn cho lớp chơi lại lượt mới** | Chơi thử vòng 2 | Bấm nút **↺ RESET** $\rightarrow$ Xác nhận hộp thoại $\rightarrow$ Toàn bộ kết quả được làm mới về trạng thái ban đầu. |

---

## 🔑 Thông Tin Kỹ Thuật Cần Nhớ
- **Link Học sinh**: `http://localhost:4000` (hoặc URL máy chủ)
- **Link Giáo viên**: `http://localhost:4000/#teacher`
- **Mã PIN Giáo viên**: **`3568`**
- **Phân bổ chuẩn**: Welcome (7) • Media (7) • Logistics (6) = **20 Pairs**

