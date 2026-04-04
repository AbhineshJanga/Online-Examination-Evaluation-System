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

// Store active users
const activeUsers = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 🔵 Student joins exam
  socket.on("join-exam", ({ userId, examId }) => {
    if (!userId || !examId) return;

    activeUsers[userId] = {
      socketId: socket.id,
      examId,
      violations: 0
    };

    console.log(`🟢 User ${userId} joined exam ${examId}`);
  });

  // 🚨 Monitoring event (tab switch, blur, fullscreen exit)
  socket.on("monitoring-event", (data) => {
    if (!data || !data.userId || !data.examId) return;

    const { userId, examId, type } = data;

    console.log(`🚨 ${type} detected from ${userId}`);

    // Increase violation count
    if (activeUsers[userId]) {
      activeUsers[userId].violations++;
    }

    // Emit alert to teacher/admin
    io.emit("cheating-alert", {
      userId,
      examId,
      type,
      violations: activeUsers[userId]?.violations || 0,
      time: new Date().toISOString()
    });
  });

  // ❌ Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    for (let userId in activeUsers) {
      if (activeUsers[userId].socketId === socket.id) {
        delete activeUsers[userId];
        break;
      }
    }
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});