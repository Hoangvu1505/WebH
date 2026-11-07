import React from "react";

export default function AnimeHost({ speechText, mood = "happy" }) {
  return (
    <div className="anime-host-wrapper">
      {/* Bong bóng thoại Speech Bubble */}
      <div className="speech-bubble">
        <p className="speech-text">{speechText || "Welcome to BUZZ TO APPLY!"}</p>
      </div>

      {/* Nhân vật HR phong cách Anime (Chibi Recruiter) */}
      <div className={`anime-character mood-${mood}`}>
        <svg
          viewBox="0 0 120 120"
          width="84"
          height="84"
          className="host-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tóc sau */}
          <path
            d="M28 42 C16 65 24 95 38 98 C34 78 36 60 42 45 Z"
            fill="#3a2318"
          />
          <path
            d="M92 42 C104 65 96 95 82 98 C86 78 84 60 78 45 Z"
            fill="#3a2318"
          />

          {/* Cổ áo & Thân áo học đường / HR vest */}
          <path
            d="M40 85 L80 85 L86 120 L34 120 Z"
            fill="#1b4332"
          />
          {/* Cổ áo sơ mi trắng & Cà vạt cam */}
          <polygon points="50,85 70,85 60,100" fill="#fffdfa" />
          <polygon points="58,92 62,92 64,115 60,118 56,115" fill="#e76f51" />

          {/* Đầu và Mặt */}
          <circle cx="60" cy="52" r="30" fill="#ffdfcb" />

          {/* Tóc trước & Mái */}
          <path
            d="M32 46 C32 26 50 16 60 16 C76 16 88 26 88 46 C80 34 72 32 60 33 C48 32 40 35 32 46 Z"
            fill="#4a2e20"
          />
          <path
            d="M42 32 C48 44 48 50 44 54 C47 48 53 44 55 33 Z"
            fill="#4a2e20"
          />
          <path
            d="M78 32 C72 44 72 50 76 54 C73 48 67 44 65 33 Z"
            fill="#4a2e20"
          />

          {/* Má hồng (Blush) */}
          <ellipse cx="44" cy="62" rx="4" ry="2.5" fill="#ff9999" opacity="0.6" />
          <ellipse cx="76" cy="62" rx="4" ry="2.5" fill="#ff9999" opacity="0.6" />

          {/* Mắt biểu cảm theo mood */}
          {mood === "success" || mood === "happy" ? (
            /* Mắt cười tít hình trăng khuyết */
            <g stroke="#2f2a4a" strokeWidth="2.8" strokeLinecap="round" fill="none">
              <path d="M42 54 Q48 48 54 54" />
              <path d="M66 54 Q72 48 78 54" />
            </g>
          ) : mood === "urgent" ? (
            /* Mắt mở to tập trung */
            <g fill="#2f2a4a">
              <ellipse cx="48" cy="53" rx="4.5" ry="5.5" />
              <ellipse cx="72" cy="53" rx="4.5" ry="5.5" />
              <circle cx="49" cy="51" r="1.8" fill="#fff" />
              <circle cx="73" cy="51" r="1.8" fill="#fff" />
            </g>
          ) : mood === "oops" ? (
            /* Mắt nhắm tịt */
            <g stroke="#2f2a4a" strokeWidth="2.5" strokeLinecap="round">
              <line x1="43" y1="51" x2="52" y2="56" />
              <line x1="43" y1="56" x2="52" y2="51" />
              <line x1="68" y1="51" x2="77" y2="56" />
              <line x1="68" y1="56" x2="77" y2="51" />
            </g>
          ) : (
            /* Mắt to tròn thân thiện bình thường */
            <g fill="#2f2a4a">
              <ellipse cx="48" cy="54" rx="4" ry="5" />
              <ellipse cx="72" cy="54" rx="4" ry="5" />
              <circle cx="49.5" cy="52" r="1.6" fill="#fff" />
              <circle cx="73.5" cy="52" r="1.6" fill="#fff" />
            </g>
          )}

          {/* Miệng cười */}
          {mood === "oops" ? (
            <path
              d="M56 68 Q60 64 64 68"
              stroke="#b23b20"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M54 65 Q60 72 66 65"
              stroke="#b23b20"
              strokeWidth="2.2"
              fill="#f4a261"
              strokeLinecap="round"
            />
          )}

          {/* Clipboard Tuyển dụng (HR badge/board) */}
          <rect
            x="76"
            y="76"
            width="28"
            height="36"
            rx="3"
            fill="#e9c46a"
            stroke="#997000"
            strokeWidth="1.5"
            transform="rotate(-10 90 94)"
          />
          <rect
            x="82"
            y="81"
            width="16"
            height="3"
            rx="1.5"
            fill="#555"
            transform="rotate(-10 90 94)"
          />
          <line
            x1="81"
            y1="89"
            x2="98"
            y2="86"
            stroke="#666"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="81"
            y1="94"
            x2="95"
            y2="91.5"
            stroke="#666"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="81"
            y1="99"
            x2="92"
            y2="97"
            stroke="#666"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

