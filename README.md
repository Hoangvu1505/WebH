# 🚀 BUZZ TO APPLY! — Volunteer Recruitment Challenge
### Thiết kế theo đúng tài liệu `Brief.md` & `specific.md` cho tiết Tiếng Anh lớp 10

Hệ thống mini-game tranh suất tình nguyện theo thời gian thực (Real-time Socket.IO) phục vụ **20 cặp học sinh (P01–P20)** sử dụng điện thoại thông minh cùng tranh **3 Roles (Welcome: 7, Media: 7, Logistics: 6 = 20 suất)** theo cơ chế **First-Come, First-Served (FCFS)** chuẩn xác 100%, bảo đảm không có race condition hay overbooking.

---

## 🌟 TÍNH NĂNG ĐÃ THIẾT KẾ ĐÚNG 100% YÊU CẦU

### 1. Phân bổ & Luật chơi
- **20 Cặp học sinh**: `P01` đến `P20` (Mỗi cặp dùng 1 điện thoại).
- **3 Vị trí Tình nguyện (Roles)**:
  - 👋 **Welcome Team**: 7 pairs (Welcoming guests, greeting teachers)
  - 📸 **Media Team**: 7 pairs (Photography, videography, laptops & editing)
  - 📦 **Logistics Team**: 6 pairs (Stage setup, props, gifts & decorations)
- **Tổng cộng**: **20 pairs**
- **Cơ chế**: FCFS (First-Come, First-Served) được xử lý Atomic tại máy chủ Node.js.

### 2. Giao diện Học sinh (Student Interface - 100% Tiếng Anh)
- **Bước 1 (Chọn Pair ID)**: Lưới 20 nút từ `P01` đến `P20`, hiển thị danh sách các cặp đã có suất (`Secured`).
- **Bước 2 (Waiting Room)**: 
  - Tiêu đề: **YOU'RE IN!** (*Welcome, Pair PXX! Waiting for the teacher to start...*)
  - Cho xem trước 3 Role cards nhưng nút đang ở chế độ chờ (*Waiting...*).
  - Tự động chuyển màn hình khi Giáo viên bấm START mà không cần tải lại trang.
- **Bước 3 (Role Selection)**:
  - Tiêu đề: **READY? GO!** (*Choose your dream team!*)
  - 3 Thẻ Role Cards nổi bật, hiển thị số suất còn lại: `Slots left: X/7` hoặc `X/6`.
  - Nhãn nhấp nháy **ONLY 1 SLOT LEFT!** khi chỉ còn 1 suất.
  - Khi hết suất: Nút chuyển sang **FULL!**, thẻ mờ đi và bị khóa.
  - Nút **APPLY!** to, phản hồi tức thời, hiển thị `Processing...` khi đang xử lý để chống bấm đúp.
- **Bước 4 (Kết quả đăng ký)**:
  - **Thành công**:
    - **REGISTRATION SUCCESSFUL!**
    - *Congratulations, Pair PXX! You've secured a spot on the [Role Name]!*
    - Hiệu ứng pháo hoa Confetti + Dấu kiểm + Huy hiệu `ROLE SECURED ✓`.
  - **Khi role vừa đầy**:
    - **OOPS! THIS TEAM IS FULL!**
    - *Please choose another available team.*
  - **Khi hết giờ / Đóng phòng**:
    - **REGISTRATION CLOSED!**
    - *Please contact your teacher.*

### 3. Nhân vật HR Anime Host & Âm thanh
- **HR Anime Host**: Nhân vật chibi phong cách anime với bong bóng thoại linh hoạt theo ngữ cảnh (Welcome, Waiting, Ready, Success, Full, Urgent khi <10s).
- **Hệ thống âm thanh Web Audio API (Có nút MUTE/UNMUTE)**:
  - Start Fanfare / Whistle khi giáo viên bấm START.
  - Pop sound khi bấm nút.
  - Celebration Chimes khi giành suất thành công.
  - Gentle Alert tone khi role đầy.
  - Tick-tock warning khi đồng hồ còn 10 giây cuối.
  - Buzzer sound khi kết thúc / hết giờ.

### 4. Bảng điều khiển Giáo viên (Teacher Dashboard - Projector Mode)
- Bảo vệ bằng mã PIN (Mặc định: `1234`).
- **Nút điều khiển**: **START**, **CLOSE / END**, **RESET** (kèm hộp thoại xác nhận).
- **Cài đặt đếm ngược**: Chọn 60s, 90s (Mặc định), 120s.
- **Đồng hồ đếm ngược**: Đồng bộ theo thời gian thực tới tất cả học sinh, tự động đóng đăng ký khi về `00:00`.
- **Projector Board**:
  - Cột **Welcome Team** (X/7) kèm danh sách mã cặp.
  - Cột **Media Team** (Y/7) kèm danh sách mã cặp.
  - Cột **Logistics Team** (Z/6) kèm danh sách mã cặp.
  - Khu vực **NOT REGISTERED YET** hiển thị các cặp chưa có role.
- **Công cụ xử lý sự cố (Troubleshooting)**:
  - Gán thủ công (Manual Assign) hoặc chuyển role cho học sinh bị lỗi mạng.
  - Hủy đăng ký (Unassign) để học sinh chọn lại.
  - Kiểm tra nghiêm ngặt không vượt quá 7–7–6.
- **Mã QR Code**: Tự động sinh mã kích thước lớn để chiếu lên máy chiếu cho học sinh quét điện thoại vào phòng.

---

## ⚡ HƯỚNG DẪN CHẠY & SỬ DỤNG

### 1. Khởi động hệ thống
```bash
# Cài đặt thư viện
npm run install:all

# Chạy hệ thống (Server + Client)
npm start
```

### 2. Đường dẫn truy cập
- **Dành cho Học sinh**: `http://localhost:4000` (hoặc quét mã QR trên màn hình giáo viên).
- **Dành cho Giáo viên**: `http://localhost:4000/#teacher` *(Mã PIN bảo mật: `3568`)*.

### 3. Kiểm thử tải đồng thời (50 Clients)
```bash
node server/test-concurrency.js
```
