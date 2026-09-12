require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const { initSocket } = require("./socket");
const requestLogger = require("./middleware/requestLogger");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registrations");
const attendanceRoutes = require("./routes/attendance");
const foodRoutes = require("./routes/food");
const resultRoutes = require("./routes/results");
const certificateRoutes = require("./routes/certificates");
const announcementRoutes = require("./routes/announcements");
const feedbackRoutes = require("./routes/feedback");
const helpRoutes = require("./routes/help");
const adminRoutes = require("./routes/admin");
const volunteerRoutes = require("./routes/volunteer");
const upiRoutes = require("./routes/upi");
const logRoutes = require("./routes/logs");

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: clientOrigin, methods: ["GET", "POST"] },
});
initSocket(io);

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "10mb" }));
app.use(requestLogger);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/help", helpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/upi", upiRoutes);
app.use("/api/logs", logRoutes);

// Centralized error handler (e.g. multer file-size/type errors)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\nTechAstra API listening on port ${PORT}`);
  console.log(
    "Every API request AND every click on the frontend will be logged below (see server/middleware/requestLogger.js and client/src/lib/clickLogger.js).\n"
  );
});
