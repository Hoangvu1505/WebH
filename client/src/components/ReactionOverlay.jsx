import React, { useState, useEffect } from "react";
import { socket } from "../socket";

export default function ReactionOverlay() {
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    const handleReaction = (data) => {
      if (!data || !data.emoji) return;

      const newReaction = {
        id: data.id || Math.random().toString(36).substring(2, 9),
        emoji: data.emoji,
        pair: data.pair,
        xOffset: data.xOffset ?? (Math.floor(Math.random() * 80) + 10),
        driftX: (Math.random() - 0.5) * 80, // Lượn sóng sang trái/phải từ -40px đến +40px
        rotation: (Math.random() - 0.5) * 24, // Nghiêng tự nhiên từ -12deg đến +12deg
        scale: 0.95 + Math.random() * 0.3,   // Kích thước to nhỏ so le
        duration: 2.2 + Math.random() * 0.6   // 2.2s đến 2.8s
      };

      setReactions((prev) => {
        // Giữ tối đa 30 phần tử để đảm bảo luôn mượt mà 60 FPS
        const updated = prev.length >= 30 ? prev.slice(prev.length - 29) : prev;
        return [...updated, newReaction];
      });
    };

    socket.on("reaction:broadcast", handleReaction);

    return () => {
      socket.off("reaction:broadcast", handleReaction);
    };
  }, []);

  const handleAnimationEnd = (id) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="reaction-overlay-container">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="floating-reaction"
          onAnimationEnd={() => handleAnimationEnd(r.id)}
          style={{
            left: `${r.xOffset}%`,
            "--drift-x": `${r.driftX}px`,
            "--target-rotate": `${r.rotation}deg`,
            "--target-scale": r.scale,
            animationDuration: `${r.duration}s`
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
