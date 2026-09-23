const express = require("express");
const prisma = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { scanLimiter } = require("../middleware/rateLimiter");
const { logSecurityEvent } = require("../middleware/securityLogger");
const { validateMealSessionData } = require("../middleware/inputValidation");

const router = express.Router();
const VALID_SESSIONS = ["breakfast", "lunch", "snacks"];

/**
 * POST /api/food/scan
 * Hospitality team scans a registration QR + selects a meal session.
 * Blocks duplicate collection for the same session.
 */
router.post(
  "/scan",
  requireAuth,
  requireRole("hospitality", "master_admin"),
  validateMealSessionData,
  scanLimiter,
  async (req, res) => {
  try {
    const { registrationCode, mealSession } = req.body;
    
    // Input is already validated by validateMealSessionData middleware

    const registration = await prisma.registration.findUnique({
      where: { registrationCode },
      include: { user: true },
    });
    if (!registration) return res.status(404).json({ error: "No registration found for this QR code" });
    if (registration.status !== "approved") {
      return res.status(409).json({ error: "This registration is not approved" });
    }

    const existing = await prisma.foodLog.findUnique({
      where: { registrationId_mealSession: { registrationId: registration.id, mealSession } },
    });
    if (existing) {
      return res.status(409).json({
        error: `${registration.user.name} has already collected ${mealSession}`,
        alreadyCollected: true,
        collectedAt: existing.collectedAt,
      });
    }

    const log = await prisma.foodLog.create({
      data: { registrationId: registration.id, mealSession },
    });

    // Log food collection
    logSecurityEvent(
      "food_collection",
      req.user.id,
      { 
        registrationCode, 
        mealSession, 
        participantName: registration.user.name 
      },
      req
    );

    res.status(201).json({
      foodLog: log,
      participant: { name: registration.user.name, code: registration.registrationCode },
    });
  } catch (err) {
    console.error("Food scan error:", err);
    res.status(500).json({ error: "Failed to record food collection" });
  }
});

/** GET /api/food/session/:mealSession - list of who has collected a given session. */
router.get(
  "/session/:mealSession",
  requireAuth,
  requireRole("hospitality", "master_admin"),
  async (req, res) => {
    try {
      const logs = await prisma.foodLog.findMany({
        where: { mealSession: req.params.mealSession },
        orderBy: { collectedAt: "desc" },
      });
      res.json({ logs, count: logs.length });
    } catch (err) {
      console.error("Food session list error:", err);
      res.status(500).json({ error: "Failed to load food logs" });
    }
  }
);

module.exports = router;
