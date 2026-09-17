const express = require("express");
const prisma = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { broadcastAnnouncement } = require("../socket");

const router = express.Router();

/** GET /api/announcements - public, most recent first (for the ticker/pop-ups). */
router.get("/", async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json({ announcements });
  } catch (err) {
    console.error("List announcements error:", err);
    res.status(500).json({ error: "Failed to load announcements" });
  }
});

/** POST /api/announcements - master_admin only: create + broadcast via Socket.io. */
router.post("/", requireAuth, requireRole("master_admin"), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Announcement message is required" });
    }

    const announcement = await prisma.announcement.create({
      data: { message: message.trim(), createdBy: req.user.id },
    });

    broadcastAnnouncement(announcement);
    res.status(201).json({ announcement });
  } catch (err) {
    console.error("Create announcement error:", err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

module.exports = router;
