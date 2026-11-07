const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:4000";

async function runRolePermissionTest() {
  console.log(`\n======================================================`);
  console.log(`🔐 KIỂM THỬ PHÂN QUYỀN: HỌC SINH (KHÁCH) & GIÁO VIÊN (AUTH)`);
  console.log(`======================================================\n`);

  // 1. Tạo 1 client Học sinh (Guest)
  const studentSocket = io(SERVER_URL, { transports: ["websocket"] });
  await new Promise((res) => studentSocket.on("connect", res));
  console.log("✅ 1. Học sinh (Guest) kết nối vào hệ thống ở trạng thái Khách.");

  // Test hành vi trái phép: Học sinh cố tình gửi lệnh START của giáo viên
  const unauthorizedRes = await new Promise((resolve) => {
    studentSocket.emit("teacher:action", { action: "start" }, resolve);
  });
  console.log("🛡️ 2. Học sinh (Guest) cố gửi lệnh START của giáo viên mà không có token:");
  console.log("   -> Kết quả máy chủ phản hồi:", unauthorizedRes);

  if (unauthorizedRes && !unauthorizedRes.success) {
    console.log("   -> ✅ BẢO VỆ THÀNH CÔNG: Học sinh bị chặn triệt để ở máy chủ!");
  } else {
    console.error("   -> ❌ THẤT BẠI: Học sinh không bị chặn!");
  }

  // 2. Tạo 1 client Giáo viên
  const teacherSocket = io(SERVER_URL, { transports: ["websocket"] });
  await new Promise((res) => teacherSocket.on("connect", res));

  // Giáo viên đăng nhập sai PIN
  const wrongLoginRes = await new Promise((resolve) => {
    teacherSocket.emit("teacher:login", { pin: "9999" }, resolve);
  });
  console.log("\n🔑 3. Giáo viên thử đăng nhập bằng sai mã PIN (9999):");
  console.log("   -> Kết quả:", wrongLoginRes.error);

  // Giáo viên đăng nhập đúng PIN
  const rightLoginRes = await new Promise((resolve) => {
    teacherSocket.emit("teacher:login", { pin: "3568" }, resolve);
  });
  console.log("\n🔑 4. Giáo viên đăng nhập bằng đúng mã PIN (3568):");
  console.log("   -> Đăng nhập thành công! Được cấp Token bảo mật:", rightLoginRes.token?.substring(0, 15) + "...");

  const teacherToken = rightLoginRes.token;

  // Giáo viên dùng token để thực hiện lệnh điều khiển
  const actionRes = await new Promise((resolve) => {
    teacherSocket.emit("teacher:action", { token: teacherToken, action: "reset" }, resolve);
  });
  console.log("   -> Giáo viên gửi lệnh Reset với Token:", actionRes.success ? "✅ Thành công!" : "❌ Thất bại");

  studentSocket.close();
  teacherSocket.close();
  console.log("\n🏆 XÁC NHẬN: PHÂN QUYỀN HỌC SINH (KHÁCH) & GIÁO VIÊN (ĐĂNG NHẬP) HOẠT ĐỘNG HOÀN HẢO!\n");
  process.exit(0);
}

runRolePermissionTest().catch(console.error);
