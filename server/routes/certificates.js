const express = require("express");
const prisma = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { generateCertificateCode } = require("../utils/codes");
const { generateCertificatePdf } = require("../utils/certificatePdf");

const router = express.Router();

/**
 * GET /api/certificates/participants
 * Certificate Team view: all approved participants + winner flag, filterable
 * by event/college/winner status.
 */
router.get(
  "/participants",
  requireAuth,
  requireRole("certificate_team", "master_admin"),
  async (req, res) => {
    try {
      const { eventId, college, winnersOnly } = req.query;

      const registrations = await prisma.registration.findMany({
        where: {
          status: "approved",
          ...(eventId ? { eventIds: { has: eventId } } : {}),
          ...(college ? { collegeName: { equals: college, mode: "insensitive" } } : {}),
        },
        include: { user: true },
      });

      const results = await prisma.result.findMany();
      const winnerMap = new Map(); // registrationId -> [{eventId, position}]
      for (const r of results) {
        if (!winnerMap.has(r.registrationId)) winnerMap.set(r.registrationId, []);
        winnerMap.get(r.registrationId).push({ eventId: r.eventId, position: r.position });
      }

      const existingCerts = await prisma.certificate.findMany();
      const certKey = (regId, evId, type) => `${regId}:${evId}:${type}`;
      const certSet = new Set(existingCerts.map((c) => certKey(c.registrationId, c.eventId, c.type)));

      let rows = [];
      for (const reg of registrations) {
        for (const evId of reg.eventIds) {
          const wins = (winnerMap.get(reg.id) || []).filter((w) => w.eventId === evId);
          const isWinner = wins.length > 0;
          rows.push({
            registrationId: reg.id,
            registrationCode: reg.registrationCode,
            participantName: reg.user.name,
            college: reg.collegeName,
            eventId: evId,
            isWinner,
            position: isWinner ? wins[0].position : null,
            participationCertGenerated: certSet.has(certKey(reg.id, evId, "participation")),
            winnerCertGenerated: isWinner && certSet.has(certKey(reg.id, evId, "winner")),
          });
        }
      }

      if (winnersOnly === "true") rows = rows.filter((r) => r.isWinner);

      res.json({ rows });
    } catch (err) {
      console.error("Certificate participants error:", err);
      res.status(500).json({ error: "Failed to load participant list" });
    }
  }
);

/**
 * POST /api/certificates/generate
 * Body: { registrationId, eventId, type: "participation" | "winner" }
 */
router.post(
  "/generate",
  requireAuth,
  requireRole("certificate_team", "master_admin"),
  async (req, res) => {
    try {
      const { registrationId, eventId, type } = req.body;
      if (!registrationId || !eventId || !["participation", "winner"].includes(type)) {
        return res.status(400).json({ error: "registrationId, eventId and a valid type are required" });
      }

      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: { user: true },
      });
      if (!registration) return res.status(404).json({ error: "Registration not found" });

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ error: "Event not found" });

      let position = null;
      if (type === "winner") {
        const result = await prisma.result.findFirst({ where: { eventId, registrationId } });
        if (!result) return res.status(409).json({ error: "This participant is not a winner for this event" });
        position = result.position;
      }

      const certificateCode = await generateCertificateCode(prisma);
      const pdfUrl = await generateCertificatePdf({
        certificateCode,
        participantName: registration.teamName
          ? `${registration.user.name} (${registration.teamName})`
          : registration.user.name,
        eventName: event.name,
        type,
        position,
        collegeName: registration.collegeName,
      });

      const certificate = await prisma.certificate.create({
        data: { certificateCode, registrationId, eventId, type, pdfUrl },
      });

      res.status(201).json({ certificate });
    } catch (err) {
      console.error("Generate certificate error:", err);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  }
);

/** GET /api/certificates - list all generated certificates (certificate team / admin). */
router.get("/", requireAuth, requireRole("certificate_team", "master_admin"), async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({ orderBy: { issuedAt: "desc" } });
    res.json({ certificates });
  } catch (err) {
    console.error("List certificates error:", err);
    res.status(500).json({ error: "Failed to load certificates" });
  }
});

/** GET /api/certificates/mine - participant's own issued certificates for the dashboard. */
router.get("/mine", requireAuth, requireRole("participant"), async (req, res) => {
  try {
    const registration = await prisma.registration.findUnique({ where: { userId: req.user.id } });
    if (!registration) return res.json({ certificates: [] });

    const certificates = await prisma.certificate.findMany({
      where: { registrationId: registration.id },
      orderBy: { issuedAt: "desc" },
    });
    res.json({ certificates });
  } catch (err) {
    console.error("My certificates error:", err);
    res.status(500).json({ error: "Failed to load certificates" });
  }
});

/** GET /api/certificates/verify/:code - public certificate verification. */
router.get("/verify/:code", async (req, res) => {
  try {
    const certificate = await prisma.certificate.findUnique({ where: { certificateCode: req.params.code } });
    if (!certificate) {
      return res.json({ valid: false });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: certificate.registrationId },
      include: { user: true },
    });
    const event = await prisma.event.findUnique({ where: { id: certificate.eventId } });

    res.json({
      valid: true,
      certificateCode: certificate.certificateCode,
      type: certificate.type,
      participantName: registration?.user?.name,
      college: registration?.collegeName,
      eventName: event?.name,
      issuedAt: certificate.issuedAt,
    });
  } catch (err) {
    console.error("Verify certificate error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;
