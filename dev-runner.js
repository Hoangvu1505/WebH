const { spawn } = require("child_process");
const path = require("path");

console.log("\x1b[36m%s\x1b[0m", "⚡ Đang khởi động hệ thống BUZZ TO APPLY (Server + Client)...");

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

// Khởi động server
const server = spawn("node", ["--watch", "server.js"], {
  cwd: path.join(__dirname, "server"),
  stdio: "inherit",
  shell: true
});

// Khởi động client
const client = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "client"),
  stdio: "inherit",
  shell: true
});

function cleanup() {
  console.log("\nĐang tắt các tiến trình...");
  server.kill();
  client.kill();
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

