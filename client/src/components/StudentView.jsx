import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import AnimeHost from "./AnimeHost";
import { sounds } from "../utils/sound";

const STATUS_LABELS = {
  waiting: "WAITING…",
  open: "OPEN",
  closed: "CLOSED"
};

export default function StudentView({
  state,
  myPair,
  setMyPair,
  onApply,
  applying,
  errorMessage,
  setErrorMessage
}) {
  const { config, status, assign, counts, allPairs, timeRemaining } = state;
  const roles = config?.roles || [];
  const roleById = Object.fromEntries(roles.map((r) => [r.id, r]));

  const myAssignedRoleId = myPair ? assign[myPair] : null;
  const myRole = myAssignedRoleId ? roleById[myAssignedRoleId] : null;

  // Format thời gian đếm ngược MM:SS
  const formatTime = (secs) => {
    const s = Math.max(0, secs || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m < 10 ? "0" + m : m}:${rem < 10 ? "0" + rem : rem}`;
  };

  // Pháo hoa khi giành suất thành công
  useEffect(() => {
    if (myAssignedRoleId) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [myAssignedRoleId]);

  // Xác định câu thoại và tâm trạng của Anime Host
  let hostSpeech = "Welcome to BUZZ TO APPLY! Select your Pair ID to join!";
  let hostMood = "normal";

  if (!myPair) {
    hostSpeech = "Welcome, future volunteers! Select your Pair ID to join the challenge.";
    hostMood = "happy";
  } else if (myAssignedRoleId) {
    hostSpeech = `Congratulations! You've secured your role in the ${myRole?.name}!`;
    hostMood = "success";
  } else if (status === "waiting") {
    hostSpeech = `Welcome, Pair ${myPair}! Waiting for the teacher to start... Get ready to grab your spot!`;
    hostMood = "happy";
  } else if (status === "open") {
    if (timeRemaining <= 10 && timeRemaining > 0) {
      hostSpeech = "Hurry! Time is running out! Grab your spot now!";
      hostMood = "urgent";
    } else {
      hostSpeech = "Ready? GO! Choose your dream team now! Fast fingers win!";
      hostMood = "happy";
    }
  } else if (status === "closed") {
    hostSpeech = "Registration closed! Please contact your teacher if you haven't got a role.";
    hostMood = "oops";
  }

  // -------------------------------------------------------------
  // BƯỚC 1: HỌC SINH CHỌN PAIR ID (P01..P20)
  // -------------------------------------------------------------
  if (!myPair) {
    return (
      <div className="card">
        <AnimeHost speechText={hostSpeech} mood={hostMood} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <b style={{ fontSize: "17px", color: "var(--ink)" }}>Select your Pair ID</b>
            <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              Welcome, future volunteers! Choose your assigned pair.
            </div>
          </div>
          <span className={`status st-${status}`}>{STATUS_LABELS[status] || status}</span>
        </div>

        <div className="pairs-grid">
          {(allPairs || []).map((p) => {
            const isTaken = !!assign[p];
            return (
              <button
                key={p}
                className={`pbtn ${isTaken ? "taken" : ""}`}
                onClick={() => {
                  setErrorMessage("");
                  setMyPair(p);
                  sounds.playPop();
                }}
              >
                {p}
                {isTaken && <span className="badge-assigned">Secured</span>}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "14px", textAlign: "center" }}>
          📌 One representative per pair uses a smartphone.
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // BƯỚC 2 & 3 & 4: MÀN HÌNH SAU KHI ĐÃ CHỌN PAIR ID
  // -------------------------------------------------------------
  const isUrgent = status === "open" && timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className="card">
      <AnimeHost speechText={hostSpeech} mood={hostMood} />

      {/* Header trạng thái của cặp */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <b style={{ fontSize: "20px", color: "var(--primary-green)" }}>PAIR {myPair}</b>
        </div>
        <span className={`status st-${status}`}>{STATUS_LABELS[status] || status}</span>
      </div>

      {/* Đồng hồ đếm ngược Countdown Bar khi đang OPEN */}
      {status === "open" && !myAssignedRoleId && (
        <div className={`countdown-box ${isUrgent ? "warning" : ""}`} style={{ marginTop: "10px" }}>
          <span className="countdown-label">TIME REMAINING:</span>
          <span className="countdown-digits">{formatTime(timeRemaining)}</span>
        </div>
      )}

      {/* Thông báo lỗi nếu bấm trúng role đầy (Case B) */}
      {errorMessage && <div className="msg-banner bad">{errorMessage}</div>}

      {/* TRƯỜNG HỢP A: ĐÃ ĐĂNG KÝ THÀNH CÔNG (REGISTRATION SUCCESSFUL!) */}
      {myAssignedRoleId && myRole ? (
        <div className="big-view success">
          <div className="big-icon">{myRole.emoji}</div>
          <h2>REGISTRATION SUCCESSFUL!</h2>
          <div style={{ fontSize: "16px", color: "#2d543e", marginTop: "6px", lineHeight: "1.4" }}>
            Congratulations, <b>Pair {myPair}</b>!
            <br />
            You've secured a spot on the <b>{myRole.name}</b>!
          </div>
          <div className="secured-badge">ROLE SECURED ✓</div>
        </div>
      ) : status === "waiting" ? (
        /* TRƯỜNG HỢP BƯỚC 2: PHÒNG CHỜ (WAITING ROOM) */
        <div className="big-view">
          <div className="big-icon">⏳</div>
          <h2>YOU'RE IN!</h2>
          <div style={{ fontSize: "16.5px", fontWeight: "700", color: "var(--primary-green)" }}>
            Welcome, Pair {myPair}!
          </div>
          <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
            Waiting for the teacher to start... Get ready to grab your spot!
          </div>

          {/* Xem trước 3 Role Cards ở chế độ khóa */}
          <div style={{ marginTop: "16px", textAlign: "left" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--muted)", textTransform: "uppercase" }}>
              Preview Roles (Opening Soon):
            </div>
            <div className="roles-container">
              {roles.map((r) => (
                <div key={r.id} className={`role-card ${r.id}-theme`}>
                  <div className="role-card-header">
                    <div className="role-emoji-box">{r.emoji}</div>
                    <div className="role-info">
                      <h3 className="role-name">{r.name}</h3>
                      <p className="role-desc">{r.desc}</p>
                    </div>
                  </div>
                  <div className="role-card-footer">
                    <div className="slots-badge">
                      Slots left: <b>{r.cap}/{r.cap}</b>
                    </div>
                    <button className="apply-btn" disabled>
                      Waiting...
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : status === "closed" ? (
        /* TRƯỜNG HỢP D: ĐÃ HẾT GIỜ HOẶC ĐÓNG ĐĂNG KÝ (REGISTRATION CLOSED!) */
        <div className="big-view full">
          <div className="big-icon">🔒</div>
          <h2>REGISTRATION CLOSED!</h2>
          <div style={{ fontSize: "15px", color: "var(--muted)", marginTop: "4px" }}>
            Please contact your teacher.
          </div>
        </div>
      ) : (
        /* TRƯỜNG HỢP BƯỚC 3: PHÒNG ĐANG OPEN -> HỌC SINH TRANH SUẤT (READY? GO!) */
        <div style={{ marginTop: "10px" }}>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <b style={{ fontSize: "18px", color: "var(--primary-green)" }}>READY? GO!</b>
            <div style={{ fontSize: "13.5px", color: "var(--muted)" }}>Choose your dream team!</div>
          </div>

          <div className="roles-container">
            {roles.map((r) => {
              const taken = counts[r.id] || 0;
              const left = Math.max(0, r.cap - taken);
              const isFull = left <= 0;
              const isOnlyOne = left === 1;

              return (
                <div
                  key={r.id}
                  className={`role-card ${r.id}-theme ${isFull ? "is-full" : ""}`}
                >
                  <div className="role-card-header">
                    <div className="role-emoji-box">{r.emoji}</div>
                    <div className="role-info">
                      <h3 className="role-name">{r.name}</h3>
                      <p className="role-desc">{r.desc}</p>
                    </div>
                  </div>

                  <div className="role-card-footer">
                    <div className={`slots-badge ${isFull ? "out" : isOnlyOne ? "warning" : ""}`}>
                      <span>Slots left: <b>{left}/{r.cap}</b></span>
                      {isOnlyOne && <span className="alert-last-slot">ONLY 1 SLOT LEFT!</span>}
                    </div>

                    <button
                      className="apply-btn"
                      disabled={isFull || applying}
                      onClick={() => onApply(r.id)}
                    >
                      {isFull ? "FULL!" : applying ? "Processing..." : "APPLY!"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nút đổi Pair ID */}
      <div style={{ marginTop: "16px", paddingTop: "10px", borderTop: "1px dashed #e2d5ab" }}>
        <button
          className="icon-btn"
          style={{ width: "100%", padding: "8px", fontSize: "13px" }}
          onClick={() => {
            if (
              !myAssignedRoleId ||
              window.confirm("Change Pair ID on this device? Your current selection will remain with this Pair ID.")
            ) {
              setMyPair("");
              setErrorMessage("");
            }
          }}
        >
          ↔ Change Pair ID
        </button>
      </div>
    </div>
  );
}
