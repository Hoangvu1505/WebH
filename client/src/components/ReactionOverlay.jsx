import React from "react";

export default function ReactionOverlay({ reactions = [] }) {
  return (
    <div className="reaction-overlay-container">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="floating-reaction"
          style={{
            left: `${r.xOffset}%`,
            animationDuration: `${r.duration || 2.4}s`
          }}
        >
          <span className="reaction-emoji">{r.emoji}</span>
          {r.pair && r.pair !== "Guest" && (
            <span className="reaction-pair-tag">{r.pair}</span>
          )}
        </div>
      ))}
    </div>
  );
}

