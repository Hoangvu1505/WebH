import React, { useState } from "react";
import { sounds } from "../utils/sound";

export default function Header({
  config,
  onlineCount,
  isTeacher,
  onSwitchToTeacher,
  onSwitchToStudent
}) {
  const [bgmActive, setBgmActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleBgm = () => {
    const isPlaying = sounds.toggleBGM();
    setBgmActive(isPlaying);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sounds.setMuted(nextMute);
  };

  return (
    <header>
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="online-pill">
            <span className="online-dot" />
            <span>{onlineCount || 1} online</span>
          </div>

          {/* Huy hiệu phân quyền */}
          {isTeacher ? (
            <span className="user-role-badge teacher">
              👨‍🏫 Teacher
            </span>
          ) : (
            <span className="user-role-badge guest">
              👤 Guest
            </span>
          )}
        </div>

        <div className="top-controls">
          {/* Nút bật/tắt Nhạc nền BGM */}
          <button
            className="icon-btn"
            onClick={handleToggleBgm}
            title={bgmActive ? "Stop background music" : "Play background music"}
            style={{ color: bgmActive ? "#e76f51" : "inherit" }}
          >
            {bgmActive ? "🎵 Music" : "🔇 Music"}
          </button>

          {/* Nút bật/tắt âm thanh hiệu ứng SFX */}
          <button
            className="icon-btn"
            onClick={handleToggleMute}
            title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {isMuted ? "🔇 SFX" : "🔊 SFX"}
          </button>

          {/* Nút Teacher Portal đưa lên phía trên */}
          {!isTeacher ? (
            <button
              className="role-switcher teacher-btn"
              onClick={onSwitchToTeacher}
              title="Open Teacher Dashboard"
            >
              🔐 Teacher Portal
            </button>
          ) : (
            <button
              className="role-switcher"
              onClick={onSwitchToStudent}
              title="View student interface"
            >
              ← Student View
            </button>
          )}
        </div>
      </div>

      <div className="unit-tag">{config?.unitTag || "GRADE 10 • ENGLISH VOLUNTEER CHALLENGE"}</div>
      <h1 className="main-title">{config?.title || "BUZZ TO APPLY!"}</h1>
      <div className="subtitle">{config?.subTitle || "Volunteer Recruitment – Grab Your Spot!"}</div>
    </header>
  );
}
