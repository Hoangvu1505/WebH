import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import Header from "./components/Header";
import StudentView from "./components/StudentView";
import TeacherView from "./components/TeacherView";
import ReactionOverlay from "./components/ReactionOverlay";
import ReactionPicker from "./components/ReactionPicker";
import { sounds } from "./utils/sound";
import "./App.css";

function App() {
  const [state, setState] = useState({
    config: {
      title: "BUZZ TO APPLY!",
      subTitle: "Volunteer Recruitment – Grab Your Spot!",
      unitTag: "GRADE 10 • ENGLISH VOLUNTEER CHALLENGE",
      totalPairs: 20,
      timerDuration: 90,
      roles: [
        { id: "welcome", emoji: "👋", name: "Welcome Team", cap: 7, desc: "Greeting guests & welcoming teachers" },
        { id: "media", emoji: "📸", name: "Media Team", cap: 7, desc: "Photography, videography & social media" },
        { id: "logistics", emoji: "📦", name: "Logistics Team", cap: 6, desc: "Stage setup, props & event decorations" }
      ]
    },
    status: "waiting",
    assign: {},
    counts: { welcome: 0, media: 0, logistics: 0 },
    totalCap: 20,
    totalAssigned: 0,
    allPairs: Array.from({ length: 20 }, (_, i) => `P${i + 1 < 10 ? "0" + (i + 1) : i + 1}`),
    unassignedPairs: [],
    joinedPairs: [],
    joinedCount: 0,
    timeRemaining: 90,
    timerDuration: 90,
    logs: []
  });

  const [onlineCount, setOnlineCount] = useState(1);

  // Phân quyền: Học sinh (Guest) vs Giáo viên (Teacher)
  const [isTeacherView, setIsTeacherView] = useState(() => {
    return (
      window.location.hash === "#teacher" ||
      new URLSearchParams(window.location.search).has("teacher")
    );
  });

  // Token xác thực giáo viên
  const [teacherToken, setTeacherToken] = useState(() => {
    return sessionStorage.getItem("buzz_teacher_token") || "";
  });

  // Pair ID của học sinh (Guest)
  const [myPair, setMyPairState] = useState(() => {
    return localStorage.getItem("buzz-pair-id") || "";
  });
  const [applying, setApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const setMyPair = (pairId) => {
    setMyPairState(pairId);
    if (pairId) {
      localStorage.setItem("buzz-pair-id", pairId);
      socket.emit("student:join", { pairId });
    } else {
      localStorage.removeItem("buzz-pair-id");
      if (myPair) {
        socket.emit("student:leave", { pairId: myPair });
      }
    }
  };

  useEffect(() => {
    if (myPair) {
      socket.emit("student:join", { pairId: myPair });
    }

    if (teacherToken) {
      socket.emit("teacher:verify-token", teacherToken, (res) => {
        if (!res?.valid) {
          setTeacherToken("");
          sessionStorage.removeItem("buzz_teacher_token");
        }
      });
    }

    // 1. Nhận cập nhật trạng thái toàn bộ
    const handleStateSync = (newState) => {
      setState(newState);
      if (newState.status !== "open") {
        setErrorMessage("");
      }
    };

    const handleUsersOnline = ({ count }) => {
      setOnlineCount(count);
    };

    const handleTimerTick = ({ timeRemaining }) => {
      setState((prev) => ({ ...prev, timeRemaining }));
    };

    const handleTimerWarning = () => {
      sounds.playTick();
    };

    const handleTimerEnd = () => {
      sounds.playEnd();
    };

    const handleApplySuccess = () => {
      setApplying(false);
      setErrorMessage("");
      sounds.playSuccess();
    };

    const handleApplyFail = (data) => {
      setApplying(false);
      setErrorMessage(data?.message || "Cannot apply!");
      if (data?.isFull) {
        sounds.playFull();
      }
    };

    socket.on("state:sync", handleStateSync);
    socket.on("users:online", handleUsersOnline);
    socket.on("timer:tick", handleTimerTick);
    socket.on("timer:warning", handleTimerWarning);
    socket.on("timer:end", handleTimerEnd);
    socket.on("apply:success", handleApplySuccess);
    socket.on("apply:fail", handleApplyFail);

    const onHashChange = () => {
      setIsTeacherView(window.location.hash === "#teacher");
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      socket.off("state:sync", handleStateSync);
      socket.off("users:online", handleUsersOnline);
      socket.off("timer:tick", handleTimerTick);
      socket.off("timer:warning", handleTimerWarning);
      socket.off("timer:end", handleTimerEnd);
      socket.off("apply:success", handleApplySuccess);
      socket.off("apply:fail", handleApplyFail);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [myPair, teacherToken]);

  // Xử lý học sinh bấm APPLY
  const handleApply = (roleId) => {
    if (!myPair) {
      setErrorMessage("Please select your Pair ID first!");
      return;
    }
    sounds.playPop();
    setApplying(true);
    setErrorMessage("");

    socket.emit("student:apply", { pair: myPair, roleId }, (res) => {
      setApplying(false);
      if (!res?.success) {
        setErrorMessage(res?.message || "Operation failed");
        if (res?.isFull) {
          sounds.playFull();
        }
      }
    });
  };

  // Học sinh thả cảm xúc (Real-time Live Reaction)
  const handleSendReaction = (emoji) => {
    socket.emit("student:reaction", {
      emoji,
      pair: myPair || "Guest"
    });
  };

  // Xử lý Giáo viên điều khiển
  const handleTeacherAction = (action, payload) => {
    sounds.playPop();
    if (action === "start") {
      sounds.playStart();
    }
    socket.emit("teacher:action", {
      token: teacherToken,
      action,
      payload
    }, (res) => {
      if (!res?.success) {
        alert(res?.error || "Unauthorized action!");
      }
    });
  };

  const handleSwitchToStudent = () => {
    setIsTeacherView(false);
    history.pushState("", document.title, window.location.pathname + window.location.search);
  };

  const handleOpenTeacherPortal = () => {
    setIsTeacherView(true);
    window.location.hash = "#teacher";
  };

  return (
    <div className={`wrap ${isTeacherView ? "projector-mode" : ""}`}>
      {/* Hiệu ứng Floating Reactions bay bổng phủ toàn màn hình (Độc lập 60 FPS) */}
      <ReactionOverlay />

      <Header
        config={state.config}
        onlineCount={onlineCount}
        isTeacher={isTeacherView}
        onSwitchToTeacher={handleOpenTeacherPortal}
        onSwitchToStudent={handleSwitchToStudent}
      />

      {isTeacherView ? (
        <TeacherView
          state={state}
          teacherToken={teacherToken}
          setTeacherToken={setTeacherToken}
          onTeacherAction={handleTeacherAction}
        />
      ) : (
        <>
          <StudentView
            state={state}
            myPair={myPair}
            setMyPair={setMyPair}
            onApply={handleApply}
            applying={applying}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />

          {/* Thanh công cụ thả cảm xúc cho học sinh (Nổi ở góc dưới) */}
          <ReactionPicker
            onSendReaction={handleSendReaction}
            myPair={myPair}
          />
        </>
      )}

      {/* Footer nhỏ gọn */}
      <div className="footer-bar">
        <span>⚡ BUZZ TO APPLY! • Grade 10 English Activity</span>
      </div>
    </div>
  );
}

export default App;
