const express = require("express");
const prisma = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

/** POST /api/feedback - anyone (typically a logged-in participant) submits event feedback. */
router.post("/", async (req, res) => {
  try {
    const { eventId, userId, rating, comments } = req.body;
    if (!eventId || !rating) {
      return res.status(400).json({ error: "eventId and rating are required" });
    }
    const feedback = await prisma.feedback.create({
      data: { eventId, userId: userId || null, rating: Number(rating), comments: comments || null },
    });
    res.status(201).json({ feedback });
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

/** GET /api/feedback/:eventId - admin view of feedback for an event. */
router.get("/:eventId", requireAuth, requireRole("master_admin"), async (req, res) => {
  try {
    const feedback = await prisma.feedback.findMany({ where: { eventId: req.params.eventId } });
    res.json({ feedback });
  } catch (err) {
    console.error("List feedback error:", err);
    res.status(500).json({ error: "Failed to load feedback" });
  }
});

module.exports = router;
