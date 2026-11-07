import React, { useState } from "react";
import { sounds } from "../utils/sound";

const AVAILABLE_EMOJIS = ["❤️", "🔥", "🎉", "👏", "🚀", "🤩"];

export default function ReactionPicker({ onSendReaction, myPair }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleSelectEmoji = (emoji) => {
    sounds.playPop();
    onSendReaction(emoji);
  };

  return (
    <div className="reaction-picker-wrapper">
      {isOpen ? (
        <div className="reaction-picker-bar">
          <button
            type="button"
            className="toggle-picker-btn"
            onClick={() => setIsOpen(false)}
            title="Collapse reaction bar"
          >
            ✕
          </button>

          <div className="reaction-emojis-list">
            {AVAILABLE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="reaction-emoji-btn"
                onClick={() => handleSelectEmoji(emoji)}
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="reaction-floating-toggle"
          onClick={() => setIsOpen(true)}
          title="Open live reactions"
        >
          ✨ React
        </button>
      )}
    </div>
  );
}

