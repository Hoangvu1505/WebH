const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const CONFIG = require("./config");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// App State
let appConfig = JSON.parse(JSON.stringify(CONFIG.INITIAL_CONFIG));

let state = {
  status: "waiting", // 'waiting' | 'open' | 'closed'
  assign: {},        // { "P01": "welcome", "P05": "media", ... }
  logs: []           // [{ pair, roleId, roleName, emoji, time }]
};

// Quản lý phiên xác thực Giáo viên (Teacher Auth Sessions)
const teacherSessions = new Set(); // chứa các token hợp lệ được cấp sau khi login đúng

// Quản lý các cặp học sinh tham gia ở trạng thái Khách (Guest)
const activePairs = new Map(); // pairId -> socketId

// Countdown Timer State
let timerDuration = appConfig.timerDuration || 90;
let timeRemaining = timerDuration;
let timerInterval = null;

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  stopTimer();
  timeRemaining = timerDuration;
  
  timerInterval = setInterval(() => {
    if (state.status !== "open") {
      stopTimer();
      return;
    }

    timeRemaining--;

    // Broadcast mỗi giây
    io.emit("timer:tick", { timeRemaining });

    // Cảnh báo 10 giây cuối
    if (timeRemaining <= 10 && timeRemaining > 0) {
      io.emit("timer:warning", { timeRemaining });
    }

    // Khi hết giờ
    if (timeRemaining <= 0) {
      stopTimer();
      timeRemaining = 0;
      state.status = "closed";
      io.emit("timer:end");
      io.emit("state:sync", getPublicState());
    }
  }, 1000);
}

function getCounts() {
  const counts = {};
  appConfig.roles.forEach(r => {
    counts[r.id] = 0;
  });
  Object.values(state.assign).forEach(roleId => {
    if (counts[roleId] !== undefined) {
      counts[roleId]++;
    }
  });
  return counts;
}

function getTotalCap() {
  return appConfig.roles.reduce((sum, r) => sum + r.cap, 0);
}

function getAllPairs() {
  const total = appConfig.totalPairs || 20;
  return Array.from({ length: total }, (_, i) => {
    const num = i + 1;
    return `P${num < 10 ? "0" + num : num}`;
  });
}

// Trạng thái công khai gửi cho tất cả học sinh (Guest) và giáo viên
function getPublicState() {
  const allPairs = getAllPairs();
  const assignedPairs = Object.keys(state.assign);
  const unassignedPairs = allPairs.filter(p => !state.assign[p]);
  const joinedPairsList = Array.from(activePairs.keys());

  return {
    config: appConfig,
    status: state.status,
    assign: state.assign,
    counts: getCounts(),
    totalCap: getTotalCap(),
    totalAssigned: assignedPairs.length,
    allPairs,
    unassignedPairs,
    joinedPairs: joinedPairsList,
    joinedCount: joinedPairsList.length,
    onlineCount: io.engine.clientsCount || 0,
    timeRemaining,
    timerDuration,
    logs: state.logs.slice(-15)
  };
}

// Kiểm tra quyền Giáo viên (dựa trên token bí mật đã cấp hoặc mã PIN)
function verifyTeacherAuth(authToken, pin) {
  if (authToken && teacherSessions.has(authToken)) {
    return true;
  }
  if (pin && pin === CONFIG.TEACHER_PIN) {
    return true;
  }
  return false;
}

// REST Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    gameState: state.status,
    timeRemaining,
    assignedCount: Object.keys(state.assign).length,
    onlineClients: io.engine.clientsCount
  });
});

// Socket Event Handlers
io.on("connection", (socket) => {
  let currentPair = null;
  let isSocketTeacher = false;

  // Gửi trạng thái ban đầu cho khách ngay khi kết nối
  socket.emit("state:sync", getPublicState());
  io.emit("users:online", { count: io.engine.clientsCount });

  // ==========================================================
  // 1. PHÂN QUYỀN GIÁO VIÊN (TEACHER AUTHENTICATION & ACTIONS)
  // ==========================================================

  // Giáo viên đăng nhập
  socket.on("teacher:login", (data, callback) => {
    const { pin } = data || {};
    const isValid = pin === CONFIG.TEACHER_PIN;

    if (isValid) {
      // Sinh token bảo mật ngẫu nhiên cho phiên này
      const token = "teach_" + crypto.randomBytes(16).toString("hex");
      teacherSessions.add(token);
      isSocketTeacher = true;
      socket.teacherToken = token;

      if (typeof callback === "function") {
        callback({
          success: true,
          token,
          message: "Authentication successful! Welcome, Teacher."
        });
      }
    } else {
      if (typeof callback === "function") {
        callback({
          success: false,
          error: "Invalid Teacher PIN! Please try again."
        });
      }
    }
  });

  // Giáo viên đăng xuất
  socket.on("teacher:logout", (data, callback) => {
    const { token } = data || {};
    if (token) {
      teacherSessions.delete(token);
    }
    isSocketTeacher = false;
    socket.teacherToken = null;
    if (typeof callback === "function") {
      callback({ success: true });
    }
  });

  // Kiểm tra token có còn hiệu lực không
  socket.on("teacher:verify-token", (token, callback) => {
    const valid = !!(token && teacherSessions.has(token));
    if (valid) {
      isSocketTeacher = true;
      socket.teacherToken = token;
    }
    if (typeof callback === "function") {
      callback({ valid });
    }
  });

  // Các hành động điều khiển trò chơi của Giáo viên (Bảo vệ nghiêm ngặt)
  socket.on("teacher:action", (data, callback) => {
    const { token, pin, action, payload } = data || {};

    // Xác thực quyền Giáo viên
    if (!verifyTeacherAuth(token || socket.teacherToken, pin)) {
      if (typeof callback === "function") {
        callback({ success: false, error: "403 Forbidden: Teacher authentication required!" });
      }
      return;
    }

    if (action === "start") {
      if (state.status === "waiting" || state.status === "closed") {
        state.status = "open";
        startTimer();
      }
    } else if (action === "close") {
      state.status = "closed";
      stopTimer();
    } else if (action === "reset") {
      state.status = "waiting";
      state.assign = {};
      state.logs = [];
      stopTimer();
      timeRemaining = timerDuration;
    } else if (action === "set-timer") {
      if (payload && payload.duration) {
        timerDuration = Math.max(5, Number(payload.duration));
        timeRemaining = timerDuration;
      }
    } else if (action === "set-remaining") {
      if (payload && payload.seconds !== undefined) {
        timeRemaining = Math.max(0, Number(payload.seconds));
        timerDuration = Math.max(timerDuration, timeRemaining);
        io.emit("timer:tick", { timeRemaining });
      }
    } else if (action === "add-time") {
      const add = Number(payload?.seconds || 30);
      timeRemaining = Math.max(0, timeRemaining + add);
      timerDuration = Math.max(timerDuration, timeRemaining);
      io.emit("timer:tick", { timeRemaining });
    }

    io.emit("state:sync", getPublicState());
    if (typeof callback === "function") callback({ success: true });
  });

  // Giáo viên gán role thủ công
  socket.on("teacher:assign", (data, callback) => {
    const { token, pin, pair, roleId } = data || {};
    if (!verifyTeacherAuth(token || socket.teacherToken, pin)) {
      if (typeof callback === "function") callback({ success: false, error: "Unauthorized!" });
      return;
    }

    const role = appConfig.roles.find(r => r.id === roleId);
    if (!role) {
      if (typeof callback === "function") callback({ success: false, error: "Role not found!" });
      return;
    }

    const counts = getCounts();
    if (state.assign[pair] === roleId) {
      if (typeof callback === "function") callback({ success: true });
      return;
    }

    const targetCount = counts[roleId] || 0;
    if (targetCount >= role.cap) {
      if (typeof callback === "function") callback({ success: false, error: `${role.name} is already full (${role.cap}/${role.cap})!` });
      return;
    }

    state.assign[pair] = roleId;
    state.logs.push({
      pair,
      roleId: role.id,
      roleName: role.name,
      emoji: role.emoji,
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      isManual: true
    });

    io.emit("state:sync", getPublicState());
    if (typeof callback === "function") callback({ success: true });
  });

  // Giáo viên hủy đăng ký của 1 cặp
  socket.on("teacher:unassign", (data, callback) => {
    const { token, pin, pair } = data || {};
    if (!verifyTeacherAuth(token || socket.teacherToken, pin)) {
      if (typeof callback === "function") callback({ success: false, error: "Unauthorized!" });
      return;
    }

    if (state.assign[pair]) {
      delete state.assign[pair];
      io.emit("state:sync", getPublicState());
    }
    if (typeof callback === "function") callback({ success: true });
  });

  // ==========================================================
  // 2. PHÂN QUYỀN HỌC SINH (GUEST - TRẠNG THÁI KHÁCH)
  // ==========================================================

  // Học sinh tham gia phòng ở trạng thái khách
  socket.on("student:join", (data, callback) => {
    const { pairId } = data || {};
    if (!pairId) return;

    const existingSocketId = activePairs.get(pairId);
    let isReconnecting = false;
    if (existingSocketId && existingSocketId !== socket.id) {
      isReconnecting = true;
    }

    currentPair = pairId;
    activePairs.set(pairId, socket.id);

    io.emit("state:sync", getPublicState());

    if (typeof callback === "function") {
      callback({
        success: true,
        pairId,
        alreadyAssigned: state.assign[pairId] || null,
        isReconnecting
      });
    }
  });

  // Học sinh thả cảm xúc (Real-time Live Reactions)
  socket.on("student:reaction", (data) => {
    const { emoji, pair } = data || {};
    if (!emoji) return;

    // Broadcast tới tất cả thiết bị (kể cả máy chiếu giáo viên)
    io.emit("reaction:broadcast", {
      id: Math.random().toString(36).substring(2, 9),
      emoji,
      pair: pair || "Guest",
      timestamp: Date.now(),
      xOffset: Math.floor(Math.random() * 80) + 10 // Vị trí ngẫu nhiên từ 10% đến 90% màn hình
    });
  });

  // Học sinh đổi Pair ID
  socket.on("student:leave", (data) => {
    const { pairId } = data || {};
    if (pairId && activePairs.get(pairId) === socket.id) {
      activePairs.delete(pairId);
      currentPair = null;
      io.emit("state:sync", getPublicState());
    }
  });

  // Học sinh bấm APPLY (Tranh suất FCFS)
  socket.on("student:apply", (data, callback) => {
    const { pair, roleId } = data || {};

    if (state.status !== "open") {
      const msg = state.status === "waiting"
        ? "Waiting for the teacher to start..."
        : "REGISTRATION CLOSED! Please contact your teacher.";
      socket.emit("apply:fail", { message: msg, type: state.status });
      if (typeof callback === "function") callback({ success: false, message: msg });
      return;
    }

    if (!pair) {
      const msg = "Please select your Pair ID first!";
      socket.emit("apply:fail", { message: msg });
      if (typeof callback === "function") callback({ success: false, message: msg });
      return;
    }

    if (state.assign[pair]) {
      const currentRole = appConfig.roles.find(r => r.id === state.assign[pair]);
      const msg = `Pair ${pair} has already secured a spot on the ${currentRole ? currentRole.name : state.assign[pair]}!`;
      socket.emit("apply:fail", { message: msg });
      if (typeof callback === "function") callback({ success: false, message: msg });
      return;
    }

    const role = appConfig.roles.find(r => r.id === roleId);
    if (!role) {
      const msg = "Invalid role selected!";
      socket.emit("apply:fail", { message: msg });
      if (typeof callback === "function") callback({ success: false, message: msg });
      return;
    }

    const counts = getCounts();
    if (counts[roleId] >= role.cap) {
      const msg = "OOPS! THIS TEAM IS FULL! Please choose another available team.";
      socket.emit("apply:fail", { message: msg, isFull: true });
      if (typeof callback === "function") callback({ success: false, message: msg, isFull: true });
      return;
    }

    // Atomic assignment trong RAM
    state.assign[pair] = roleId;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
    
    state.logs.push({
      pair,
      roleId: role.id,
      roleName: role.name,
      emoji: role.emoji,
      time: timeStr
    });

    const totalAssigned = Object.keys(state.assign).length;
    if (totalAssigned >= getTotalCap()) {
      state.status = "closed";
      stopTimer();
      io.emit("recruitment:completed");
    }

    const successMsg = `REGISTRATION SUCCESSFUL! Congratulations, Pair ${pair}! You've secured a spot on the ${role.name}!`;
    socket.emit("apply:success", { pair, role, message: successMsg });

    if (typeof callback === "function") {
      callback({ success: true, pair, role, message: successMsg });
    }

    io.emit("state:sync", getPublicState());
    io.emit("event:buzz-success", {
      pair,
      roleName: role.name,
      emoji: role.emoji
    });
  });

  socket.on("disconnect", () => {
    if (socket.teacherToken) {
      // Giữ token trong set một khoảng thời gian nếu F5 hoặc có thể logout
    }
    if (currentPair && activePairs.get(currentPair) === socket.id) {
      setTimeout(() => {
        if (activePairs.get(currentPair) === socket.id) {
          activePairs.delete(currentPair);
          io.emit("state:sync", getPublicState());
        }
      }, 5000);
    }
    io.emit("users:online", { count: io.engine.clientsCount });
  });
});

// Production: Serve React client build
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const PORT = CONFIG.PORT;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Buzz Server đang chạy trên cổng ${PORT}`);
  console.log(`👉 Học sinh (Khách): http://localhost:${PORT}`);
  console.log(`👉 Giáo viên (Đăng nhập): http://localhost:${PORT}/#teacher`);
  console.log(`🔑 Mã PIN giáo viên mặc định: ${CONFIG.TEACHER_PIN}`);
});
