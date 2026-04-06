const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middleware
const verifyToken = require("./middleware/authMiddleware");

const app = express();

// ================= DATABASE =================
connectDB();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= STATIC FILES =================
app.use(express.static(path.join(__dirname, "../public")));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);

// ================= TEST ROUTES =================
app.get("/", (req, res) => {
  res.send("Online Examination Backend Running");
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

// ================= SOCKET.IO =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all (for development)
    methods: ["GET", "POST"]
  }
});

// 🔥 GLOBAL STORAGE - Active exam sessions (real-time in memory)
const activeSessions = {};

// Store active users
const activeUsers = {};

// 📌 Make activeSessions globally accessible
app.locals.activeSessions = activeSessions;

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 🔵 Student joins exam - Store detailed monitoring data
  socket.on("join-exam", ({ userId, userName, examId, examName, os, browser }) => {
    if (!userId || !examId) return;

    // Get IP address from socket handshake, beautify IPv6 localhost
    let ip = socket.handshake.address;
    if (ip === "::1") ip = "127.0.0.1"; // Convert IPv6 localhost to IPv4 for display

    // Store in activeSessions for real-time monitoring
    activeSessions[socket.id] = {
      socketId: socket.id,
      studentId: userId,
      studentName: userName || "Unknown",
      examId,
      examName: examName || "Unknown Exam",
      os: os || "Unknown",
      browser: browser || "Unknown",
      ip: ip,
      tabSwitch: 0,
      keysFlag: false,
      fullscreen: true,
      risk: "Low",
      joinedAt: new Date().toISOString(),
      violations: []
    };

    // Store in activeUsers for compatibility
    activeUsers[userId] = {
      socketId: socket.id,
      examId,
      violations: 0
    };

    console.log(`🟢 User ${userName} (${userId}) joined exam ${examName}`);
  });

  // 🚨 General suspicious activity handler (keyboard, fullscreen, etc.)
  socket.on("suspiciousActivity", (data) => {
    if (!data || !data.type) return;

    const session = activeSessions[socket.id];
    if (!session) return;

    const { type } = data;

    console.log(`🚨 ${type} detected from ${session.studentName}`);

    // Handle different suspicious activity types
    if (type === "COPY_ATTEMPT" || type === "PASTE_ATTEMPT" || type === "VIEW_SOURCE") {
      session.keysFlag = true;
      session.violations.push({
        type: type.replace(/_/g, " "),
        time: new Date().toISOString()
      });
      session.risk = "High";
    } else if (type === "EXIT_FULLSCREEN") {
      session.fullscreen = false;
      session.violations.push({
        type: "Exited fullscreen mode",
        time: new Date().toISOString()
      });
      session.risk = "High";
    }

    // Emit alert to admin
    io.emit("cheating-alert", {
      socketId: socket.id,
      userId: session.studentId,
      examId: session.examId,
      type: type.replace(/_/g, " "),
      studentName: session.studentName,
      violations: session.violations.length,
      time: new Date().toISOString()
    });
  });

  // 🚨 Monitoring event (tab switch, blur, fullscreen exit)
  socket.on("monitoring-event", (data) => {
    if (!data || !data.examId) return;

    const { examId, type } = data;
    const session = activeSessions[socket.id];

    if (!session) return;

    console.log(`🚨 ${type} detected from ${session.studentName}`);

    // Update session based on event type
    if (type === "TAB_SWITCH") {
      session.tabSwitch += 1;
      session.violations.push({
        type: "Tab switched to another window",
        time: new Date().toISOString()
      });
    } else if (type === "WINDOW_BLUR") {
      session.violations.push({
        type: "Window focus lost",
        time: new Date().toISOString()
      });
    } else if (type === "FULLSCREEN_EXIT") {
      session.fullscreen = false;
      session.violations.push({
        type: "Exited fullscreen mode",
        time: new Date().toISOString()
      });
    } else if (type === "SUSPICIOUS_KEYS") {
      session.keysFlag = true;
      session.violations.push({
        type: "Suspicious key combination detected",
        time: new Date().toISOString()
      });
    }

    // Calculate risk level
    if (session.tabSwitch > 2 || session.keysFlag) {
      session.risk = "High";
    } else if (session.tabSwitch > 0) {
      session.risk = "Medium";
    }

    // Increase violation count in activeUsers
    if (activeUsers[session.studentId]) {
      activeUsers[session.studentId].violations++;
    }

    // Emit alert to teacher/admin (real-time)
    io.emit("cheating-alert", {
      userId: session.studentId,
      examId,
      type,
      studentName: session.studentName,
      violations: activeUsers[session.studentId]?.violations || 0,
      time: new Date().toISOString()
    });
  });

  // ❌ Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    // Remove from activeSessions
    if (activeSessions[socket.id]) {
      const studentId = activeSessions[socket.id].studentId;
      delete activeSessions[socket.id];
      
      // Also remove from activeUsers
      if (activeUsers[studentId]) {
        delete activeUsers[studentId];
      }
    } else {
      // Fallback: search in activeUsers
      for (let userId in activeUsers) {
        if (activeUsers[userId].socketId === socket.id) {
          delete activeUsers[userId];
          break;
        }
      }
    }
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});