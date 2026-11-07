import React, { useState, useEffect } from "react";
import { socket } from "../socket";

const STATUS_LABELS = {
  waiting: "WAITING…",
  open: "OPEN",
  closed: "CLOSED"
};

export default function TeacherView({
  state,
  teacherToken,
  setTeacherToken,
  onTeacherAction
}) {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time remaining edit state
  const [showTimeEdit, setShowTimeEdit] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState(state.timeRemaining || 90);

  // Troubleshooting State
  const [manualPair, setManualPair] = useState("");
  const [manualRole, setManualRole] = useState("welcome");
  const [troubleMsg, setTroubleMsg] = useState("");

  // QR Zoom Modal
  const [qrZoomed, setQrZoomed] = useState(false);

  const {
    config,
    status,
    assign,
    counts,
    totalCap,
    totalAssigned,
    allPairs,
    unassignedPairs,
    joinedCount,
    timeRemaining
  } = state;

  const roles = config?.roles || [];
  const roleById = Object.fromEntries(roles.map((r) => [r.id, r]));

  // Format thời gian đếm ngược MM:SS
  const formatTime = (secs) => {
    const s = Math.max(0, secs || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m < 10 ? "0" + m : m}:${rem < 10 ? "0" + rem : rem}`;
  };

  // =========================================================================
  // 1. MÀN HÌNH ĐĂNG NHẬP GIÁO VIÊN (KHI CHƯA ĐĂNG NHẬP)
  // =========================================================================
  if (!teacherToken) {
    const handleLogin = (e) => {
      e?.preventDefault();
      if (!pinInput.trim()) {
        setPinError("Please enter your Teacher PIN!");
        return;
      }

      setIsSubmitting(true);
      setPinError("");

      socket.emit("teacher:login", { pin: pinInput.trim() }, (res) => {
        setIsSubmitting(false);
        if (res?.success && res?.token) {
          setTeacherToken(res.token);
          sessionStorage.setItem("buzz_teacher_token", res.token);
          setPinError("");
          setPinInput("");
        } else {
          setPinError(res?.error || "Incorrect PIN! Access denied.");
        }
      });
    };

    return (
      <div className="card">
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontSize: "52px", marginBottom: "8px" }}>🔐</div>
          <b style={{ fontSize: "22px", color: "var(--primary-green)", display: "block" }}>
            Teacher Dashboard Login
          </b>
          <p style={{ margin: "8px auto 18px", color: "var(--muted)", fontSize: "14px", maxWidth: "380px", lineHeight: "1.4" }}>
            Protected area for teachers & administrators only. Please log in to control game status and live board.
          </p>
        </div>

        {pinError && <div className="msg-banner bad">{pinError}</div>}

        <form onSubmit={handleLogin} style={{ maxWidth: "360px", margin: "0 auto" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "var(--ink)", marginBottom: "4px" }}>
              Teacher PIN Code:
            </label>
            <input
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "13px 14px",
                borderRadius: "14px",
                border: "2px solid #ecd896",
                fontSize: "16px",
                outline: "none"
              }}
            />
          </div>

          <button
            type="submit"
            className="action-btn btn-start"
            disabled={isSubmitting}
            style={{ width: "100%", padding: "13px", fontSize: "16px" }}
          >
            {isSubmitting ? "Verifying..." : "Log In to Dashboard"}
          </button>
        </form>

        <div style={{ marginTop: "18px", textAlign: "center", fontSize: "12px", color: "var(--muted)" }}>
          🔒 Server-side verified • Students remain in Guest Mode and cannot access this area.
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MÀN HÌNH BẢNG ĐIỀU KHIỂN SAU KHI ĐĂNG NHẬP THÀNH CÔNG
  // =========================================================================
  const studentURL = window.location.origin;
  const isUrgent = status === "open" && timeRemaining <= 10 && timeRemaining > 0;
  const percent = totalCap > 0 ? Math.round((totalAssigned / totalCap) * 100) : 0;

  // Xử lý áp dụng thời gian tùy chọn
  const handleApplyCustomTime = (seconds) => {
    const sec = Math.max(5, Number(seconds || customTimeInput));
    setCustomTimeInput(sec);
    onTeacherAction("set-timer", { duration: sec });
    onTeacherAction("set-remaining", { seconds: sec });
  };

  // Nhanh chóng thêm 30 giây khi đang chơi
  const handleAdd30Seconds = () => {
    onTeacherAction("add-time", { seconds: 30 });
  };

  const handleManualAssign = (e) => {
    e.preventDefault();
    if (!manualPair) {
      setTroubleMsg("Please select a pair!");
      return;
    }
    setTroubleMsg("");

    socket.emit(
      "teacher:assign",
      {
        token: teacherToken,
        pair: manualPair,
        roleId: manualRole
      },
      (res) => {
        if (!res?.success) {
          setTroubleMsg(res?.error || "Cannot assign role!");
        } else {
          setTroubleMsg(`Successfully assigned ${manualPair} to ${roleById[manualRole]?.name}!`);
          setManualPair("");
        }
      }
    );
  };

  const handleUnassign = (pair) => {
    if (window.confirm(`Unassign Pair ${pair}? They will be able to apply again.`)) {
      socket.emit("teacher:unassign", { token: teacherToken, pair }, (res) => {
        if (!res?.success) {
          alert(res?.error || "Error unassigning pair");
        }
      });
    }
  };

  return (
    <div className="card">
      {/* Top Header & Trạng thái */}
      <div className="teacher-header-row">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <b style={{ fontSize: "22px", color: "var(--primary-green)" }}>Teacher Dashboard</b>
            <span className="user-role-badge teacher">Active</span>
          </div>
          <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "3px" }}>
            GAME STATUS: <span className={`status st-${status}`}>{STATUS_LABELS[status] || status}</span>
          </div>
        </div>

        {/* Khối hiển thị & chỉnh sửa TIME REMAINING */}
        <div className="timer-control-cluster">
          <div className={`countdown-box ${isUrgent ? "warning" : ""}`} style={{ margin: 0, padding: "8px 18px" }}>
            <span className="countdown-label" style={{ marginRight: "8px" }}>TIME REMAINING:</span>
            <span className="countdown-digits countdown-digits-large">{formatTime(timeRemaining)}</span>
          </div>

          <button
            className="icon-btn timer-edit-btn"
            onClick={() => setShowTimeEdit(!showTimeEdit)}
            title="Adjust countdown time"
          >
            ⚙️ {showTimeEdit ? "Close" : "Edit Time"}
          </button>

          {status === "open" && (
            <button
              className="icon-btn add-time-btn"
              onClick={handleAdd30Seconds}
              title="Add 30 seconds immediately"
            >
              +30s
            </button>
          )}
        </div>
      </div>

      {/* Panel chỉnh sửa thời gian (Time Remaining Controller) */}
      {showTimeEdit && (
        <div className="time-edit-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary-green)" }}>
              ⏱️ Custom Time Remaining (Seconds):
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              {[30, 60, 90, 120, 180].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  className="preset-time-btn"
                  onClick={() => handleApplyCustomTime(sec)}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
            <input
              type="number"
              min="5"
              max="600"
              value={customTimeInput}
              onChange={(e) => setCustomTimeInput(e.target.value)}
              placeholder="e.g. 90"
              style={{
                width: "90px",
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1.5px solid #ecd896",
                fontSize: "15px",
                fontWeight: "700"
              }}
            />
            <button
              type="button"
              className="action-btn btn-start"
              style={{ padding: "8px 16px", fontSize: "13px", flex: "none" }}
              onClick={() => handleApplyCustomTime(customTimeInput)}
            >
              Apply Time
            </button>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              (Sets countdown time to {formatTime(Number(customTimeInput || 0))})
            </span>
          </div>
        </div>
      )}

      {/* Thống kê Tổng quan (Đã đăng ký / Tổng số cặp & Cặp đã vào phòng chờ) */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">REGISTERED PAIRS</div>
          <div className="stat-value">
            {totalAssigned} / {totalCap} <span style={{ fontSize: "14px", color: "var(--muted)" }}>({percent}%)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">PAIRS JOINED ROOM</div>
          <div className="stat-value orange">
            {joinedCount || 0} / {allPairs?.length || 20}
          </div>
        </div>
      </div>

      {/* Các nút điều khiển trò chơi */}
      <div className="teacher-toolbar" style={{ marginTop: "14px" }}>
        <button
          className="action-btn btn-start"
          disabled={status === "open"}
          onClick={() => onTeacherAction("start")}
          title="Start countdown & open registrations for all pairs"
        >
          ▶ START
        </button>

        <button
          className="action-btn btn-close"
          disabled={status === "closed"}
          onClick={() => onTeacherAction("close")}
          title="Close registration"
        >
          ■ CLOSE / END
        </button>

        <button
          className="action-btn btn-reset"
          onClick={() => {
            if (window.confirm("RESET GAME? This will clear all registrations and return to WAITING.")) {
              onTeacherAction("reset");
            }
          }}
          title="Reset game to initial state"
        >
          ↺ RESET
        </button>
      </div>

      {/* BẢNG THEO DÕI REALTIME (PROJECTOR-FRIENDLY BOARD): 3 CỘT TEAM + 1 KHU VỰC UNASSIGNED */}
      <div style={{ marginTop: "16px" }}>
        <b style={{ fontSize: "16px", color: "var(--ink)" }}>Live Recruitment Board (Projector View)</b>

        <div className="projector-board">
          {roles.map((r) => {
            const count = counts[r.id] || 0;
            const assignedList = (allPairs || []).filter((p) => assign[p] === r.id);

            return (
              <div key={r.id} className={`team-column ${r.id}-col`}>
                <div className="col-header">
                  <span className="col-title">{r.emoji} {r.name}</span>
                  <span className="col-count">{count} / {r.cap}</span>
                </div>

                <div className="pairs-tags">
                  {assignedList.length > 0 ? (
                    assignedList.map((p) => (
                      <span key={p} className="pair-badge">
                        {p}
                        <span
                          className="unassign-x"
                          onClick={() => handleUnassign(p)}
                          title={`Unassign Pair ${p}`}
                        >
                          ×
                        </span>
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--muted)", fontStyle: "italic" }}>
                      No pairs registered yet
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* NOT REGISTERED YET (Danh sách các cặp chưa có role) */}
        <div className="unassigned-section">
          <div className="unassigned-header">
            NOT REGISTERED YET ({unassignedPairs?.length || 0} pairs):
          </div>
          <div className="unassigned-tags">
            {(unassignedPairs || []).length > 0 ? (
              unassignedPairs.map((p) => (
                <span key={p} className="unassigned-badge">
                  {p}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary-green)" }}>
                🎉 All 20 pairs have secured their spots!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XỬ LÝ SỰ CỐ (TROUBLESHOOTING CONTROLS) */}
      <div style={{ marginTop: "16px", background: "#fff", padding: "14px", borderRadius: "16px", border: "1.5px solid #ecd896" }}>
        <b style={{ fontSize: "14px", color: "var(--primary-green)" }}>🛠️ Troubleshooting / Manual Assignment</b>
        <p style={{ margin: "4px 0 10px", fontSize: "12px", color: "var(--muted)" }}>
          Manually assign or reassign a pair if a student had connection issues. Respects 7-7-6 limits.
        </p>

        {troubleMsg && (
          <div className={`msg-banner ${troubleMsg.includes("Successfully") ? "good" : "bad"}`} style={{ margin: "8px 0" }}>
            {troubleMsg}
          </div>
        )}

        <form onSubmit={handleManualAssign} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={manualPair}
            onChange={(e) => setManualPair(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "10px", border: "1.5px solid #ecd896", fontWeight: "700" }}
          >
            <option value="">Select Pair...</option>
            {(allPairs || []).map((p) => (
              <option key={p} value={p}>
                {p} {assign[p] ? `(Currently: ${roleById[assign[p]]?.name || assign[p]})` : "(Unassigned)"}
              </option>
            ))}
          </select>

          <select
            value={manualRole}
            onChange={(e) => setManualRole(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "10px", border: "1.5px solid #ecd896", fontWeight: "700" }}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id} disabled={(counts[r.id] || 0) >= r.cap}>
                {r.emoji} {r.name} ({counts[r.id] || 0}/{r.cap})
              </option>
            ))}
          </select>

          <button type="submit" className="action-btn btn-start" style={{ flex: "none", padding: "8px 16px", fontSize: "13px" }}>
            Assign / Reassign
          </button>
        </form>
      </div>

      {/* MÃ QR CODE CHO HỌC SINH QUÉT VÀO */}
      <div className="qr-container">
        <b style={{ fontSize: "15px", color: "var(--ink)" }}>📱 Student QR Code</b>
        <div style={{ fontSize: "12.5px", color: "var(--muted)", margin: "4px 0 10px" }}>
          Display this on the projector screen for students to scan with their phones.
        </div>
        <img
          alt="Student Access QR Code"
          width={180}
          height={180}
          className="qr-image"
          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(studentURL)}`}
        />
        <div style={{ marginTop: "8px" }}>
          <button
            className="qr-zoom-btn"
            onClick={() => setQrZoomed(true)}
            title="Enlarge QR code for students to scan"
          >
            🔍 Phóng to QR
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "var(--muted)", wordBreak: "break-all", marginTop: "6px" }}>
          Direct Link: <a href={studentURL} target="_blank" rel="noreferrer" style={{ color: "var(--primary-green)", fontWeight: "700" }}>{studentURL}</a>
        </div>
      </div>

      {/* QR ZOOM MODAL */}
      {qrZoomed && (
        <div
          className="qr-modal-backdrop"
          onClick={() => setQrZoomed(false)}
        >
          <div
            className="qr-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="qr-modal-close"
              onClick={() => setQrZoomed(false)}
              title="Close"
            >
              ✕
            </button>
            <div style={{ marginBottom: "14px", fontSize: "15px", fontWeight: "900", color: "var(--primary-green)", letterSpacing: "0.04em" }}>
              📱 Scan to Join!
            </div>
            <img
              alt="Student QR Code (Enlarged)"
              width={340}
              height={340}
              style={{ borderRadius: "16px", display: "block" }}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(studentURL)}`}
            />
            <div style={{ marginTop: "14px", fontSize: "13px", color: "#555", wordBreak: "break-all", maxWidth: "340px", textAlign: "center", lineHeight: "1.5" }}>
              <a href={studentURL} target="_blank" rel="noreferrer" style={{ color: "var(--primary-green)", fontWeight: "800" }}>{studentURL}</a>
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}>
              Tap anywhere outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
