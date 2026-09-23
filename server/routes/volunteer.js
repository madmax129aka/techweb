const express = require("express");
const prisma = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

/** GET /api/volunteer/me - the logged-in volunteer's duty assignment. */
router.get("/me", requireAuth, requireRole("volunteer"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      dutyDesk: user.dutyDesk,
      dutyTiming: user.dutyTiming,
      dutyRole: user.dutyRole,
    });
  } catch (err) {
    console.error("Volunteer duty error:", err);
    res.status(500).json({ error: "Failed to load duty assignment" });
  }
});

module.exports = router;
