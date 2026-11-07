**BRIEF: Website BUZZ TO APPLY! (mini-game chọn role theo thời gian thực)**

**1\. Mục đích (đọc phần này trước)**  
Website cho một tiết tiếng Anh lớp 10. 20 cặp học sinh (P01–P20), mỗi cặp dùng một điện thoại, cùng bấm APPLY để giành 1 trong 3 role tình nguyện. Role có số suất giới hạn và ai bấm trước (theo thứ tự máy chủ nhận) thì được. Giáo viên điều khiển từ một trang riêng.

- Welcome Team: 7 suất
- Media Team: 7 suất
- Logistics Team: 6 suất

Website chỉ dùng để chọn role, không cần chức năng viết bài hay chấm bài.

**2\. Điều bắt buộc (làm trước, ưu tiên cao nhất)**

- Chạy thật trên nhiều thiết bị, có link HTTPS công khai, không cần tài khoản hay cài app, dùng tốt trên điện thoại.
- Học sinh chọn Pair ID, vào phòng chờ, và chỉ bấm APPLY được sau khi giáo viên bấm START.
- Mỗi Pair ID chỉ có **một** đăng ký thành công. Role đủ suất thì nút chuyển thành FULL! và bị khóa.
- Khi hai cặp bấm suất cuối gần như cùng lúc, hệ thống chỉ nhận một cặp. Phải xử lý bằng cơ chế giao dịch an toàn ở phía máy chủ, không chỉ khóa nút trên giao diện.
- Chỉ báo "thành công" sau khi máy chủ đã xác nhận. Tải lại trang (F5) hoặc mất mạng rồi vào lại thì kết quả vẫn còn.
- Số suất còn lại tự cập nhật trên mọi thiết bị, không cần tải lại trang.
- Giao diện tiếng Anh.

**3\. Trang giáo viên (có bảo vệ bằng mã, kiểm tra ở phía máy chủ)**

- Nút START, CLOSE và RESET (RESET có hộp xác nhận).
- Hiển thị trạng thái WAITING / OPEN / CLOSED, số cặp đã đăng ký (ví dụ 15/20), danh sách cặp theo từng role và danh sách cặp chưa đăng ký. Bảng cần đủ lớn để chiếu lên máy chiếu.
- Đồng hồ đếm ngược, mặc định 90 giây (chỉnh được thành 60 giây). Hết giờ thì tự đóng đăng ký.
- Gán role thủ công, hủy hoặc chuyển role cho một cặp khi có sự cố. Các thao tác này vẫn không được vượt giới hạn 7–7–6.

**4\. Thông báo hiển thị cho học sinh**

- Thành công: "REGISTRATION SUCCESSFUL! Congratulations, Pair P05! You've secured a spot on the Media Team!"
- Role đầy: "OOPS! THIS TEAM IS FULL! Please choose another available team."
- Đã đóng: "REGISTRATION CLOSED! Please contact your teacher."
- Chưa đến giờ: "Waiting for the teacher to start..."
- Không dùng chữ "You're hired!" vì học sinh mới chọn role, chưa được tuyển thật.

**5\. Phần làm sau khi mục 2 và 3 đã chạy ổn**

- Giao diện kiểu mini-game, chủ đề trường học, bảng màu xanh lá đậm, kem, cam, vàng, mint.
- Ba thẻ role có hình minh họa riêng (👋 Welcome, 📸 Media, 📦 Logistics), nhìn rõ trên màn hình điện thoại nhỏ.
- Nhân vật HR phong cách anime kèm bong bóng thoại (ảnh tĩnh là đủ).
- Âm thanh ngắn (START, APPLY, thành công, đầy, 10 giây cuối, kết thúc) và nút MUTE. Website phải chạy bình thường khi trình duyệt chặn tự phát âm thanh.
- Nhạc nền, confetti, hoạt ảnh (tùy chọn).
- Nếu dùng hình hoặc âm thanh có sẵn, vui lòng chọn nguồn được phép sử dụng.

**6\. Pair ID và mã truy cập**  
Chưa cần đăng nhập phức tạp. Đề xuất: mỗi cặp có một mã 4 chữ số in sẵn để xác nhận Pair ID, nếu Pair ID đang được dùng ở thiết bị khác thì thông báo. \[Bạn chọn: dùng mã 4 số / chỉ chọn Pair ID.\]

**7\. Kiểm thử trước khi dùng (trên điện thoại thật)**

1. Hai thiết bị bấm suất cuối cùng lúc: chỉ một cặp được nhận.
2. Một cặp bấm APPLY nhiều lần: chỉ ghi nhận một đăng ký.
3. F5 hoặc mất mạng rồi vào lại: vẫn thấy đúng role.
4. Giáo viên bấm CLOSE khi học sinh đang đăng ký: xử lý đúng trạng thái đóng.
5. 20 cặp đăng ký: không role nào vượt giới hạn.

**8\. Bàn giao**  
Link học sinh, link giáo viên có bảo vệ, mã nguồn, hướng dẫn dùng START/CLOSE/RESET, hướng dẫn đổi Pair ID, tên role, số suất và thời gian, và quyền quản lý hosting/backend.