const CONFIG = {
  PORT: process.env.PORT || 4000,
  TEACHER_PIN: process.env.TEACHER_PIN || "3568",
  INITIAL_CONFIG: {
    title: "BUZZ TO APPLY!",
    subTitle: "Volunteer Recruitment – Grab Your Spot!",
    unitTag: "GRADE 10 • ENGLISH VOLUNTEER CHALLENGE",
    totalPairs: 20,
    timerDuration: 90, // Mặc định 90 giây theo Brief.md (có thể đổi thành 60s)
    roles: [
      {
        id: "welcome",
        emoji: "👋",
        name: "Welcome Team",
        cap: 7,
        desc: "Greeting guests, welcoming teachers & guiding attendees",
        themeColor: "#2d6a4f",
        accentColor: "#52b788"
      },
      {
        id: "media",
        emoji: "📸",
        name: "Media Team",
        cap: 7,
        desc: "Photography, videography, laptop presentation & editing",
        themeColor: "#b23b20",
        accentColor: "#e76f51"
      },
      {
        id: "logistics",
        emoji: "📦",
        name: "Logistics Team",
        cap: 6,
        desc: "Stage setup, props, gifts preparation & event decorations",
        themeColor: "#b87a00",
        accentColor: "#e9c46a"
      }
    ]
  }
};

module.exports = CONFIG;
