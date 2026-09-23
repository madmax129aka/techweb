const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { exportLimiter } = require("../middleware/rateLimiter");
const { toCsv } = require("../utils/csv");

const router = express.Router();

// Every route below is master_admin only.
router.use(requireAuth, requireRole("master_admin"));

/** GET /api/admin/analytics - aggregate stats for the dashboard charts. */
router.get("/analytics", async (req, res) => {
  try {
    const [totalRegistrations, approved, pending, rejected, events, registrations] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "approved" } }),
      prisma.registration.count({ where: { status: "pending" } }),
      prisma.registration.count({ where: { status: "rejected" } }),
      prisma.event.findMany(),
      prisma.registration.findMany(),
    ]);

    const revenue = registrations
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + r.totalAmount, 0);

    const perEventHeadcount = events.map((e) => ({
      eventId: e.id,
      eventName: e.name,
      seatsTaken: e.seatsTaken,
      maxSeats: e.maxSeats,
    }));

    const collegeCounts = {};
    for (const r of registrations) {
      if (!r.collegeName) continue;
      collegeCounts[r.collegeName] = (collegeCounts[r.collegeName] || 0) + 1;
    }
    const perCollegeStats = Object.entries(collegeCounts).map(([college, count]) => ({ college, count }));

    // Registrations over time, bucketed by day
    const byDay = {};
    for (const r of registrations) {
      const day = r.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    }
    const registrationsOverTime = Object.entries(byDay)
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, count]) => ({ date, count }));

    res.json({
      totalRegistrations,
      approved,
      pending,
      rejected,
      revenue,
      perEventHeadcount,
      perCollegeStats,
      registrationsOverTime,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

/** GET /api/admin/analytics/timeseries - daily registration counts and revenue for interactive chart */
router.get("/analytics/timeseries", async (req, res) => {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Group by date and status
    const dailyData = {};

    for (const reg of registrations) {
      const date = reg.createdAt.toISOString().slice(0, 10);
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          totalRegistrations: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          revenue: 0,
        };
      }

      dailyData[date].totalRegistrations += 1;
      dailyData[date][reg.status] = (dailyData[date][reg.status] || 0) + 1;

      // Add revenue only for approved registrations
      if (reg.status === "approved") {
        dailyData[date].revenue += reg.totalAmount;
      }
    }

    // Convert to array and sort by date
    const timeseriesData = Object.values(dailyData).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    res.json(timeseriesData);
  } catch (err) {
    console.error("Timeseries analytics error:", err);
    res.status(500).json({ error: "Failed to load timeseries data" });
  }
});

/** GET /api/admin/accounts - list all non-participant staff accounts. */
router.get("/accounts", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { not: "participant" } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users: users.map(({ passwordHash, ...u }) => u) });
  } catch (err) {
    console.error("List accounts error:", err);
    res.status(500).json({ error: "Failed to load accounts" });
  }
});

/** POST /api/admin/accounts - create a login for any staff role. */
router.post("/accounts", async (req, res) => {
  try {
    const { name, email, password, role, assignedEventId, dutyDesk, dutyTiming, dutyRole } = req.body;
    const validRoles = ["registration_team", "coordinator", "hospitality", "certificate_team", "volunteer", "master_admin"];
    if (!name || !email || !password || !validRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of ${validRoles.join(", ")}` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        assignedEventId: role === "coordinator" ? assignedEventId || null : null,
        dutyDesk: role === "volunteer" ? dutyDesk || null : null,
        dutyTiming: role === "volunteer" ? dutyTiming || null : null,
        dutyRole: role === "volunteer" ? dutyRole || null : null,
      },
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser });
  } catch (err) {
    console.error("Create account error:", err);
    res.status(500).json({ error: "Failed to create account (email may already be in use)" });
  }
});

/** PUT /api/admin/accounts/:id - edit a staff login. */
router.put("/accounts/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Update account error:", err);
    res.status(500).json({ error: "Failed to update account" });
  }
});

/** DELETE /api/admin/accounts/:id */
router.delete("/accounts/:id", async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

/** GET /api/admin/export/registrations.csv - full data export. Rate limited to prevent abuse. */
router.get("/export/registrations.csv", exportLimiter, async (req, res) => {
  try {
    const registrations = await prisma.registration.findMany({ include: { user: true } });
    
    // Collect all unique event IDs from all registrations
    const allEventIds = [...new Set(registrations.flatMap((r) => r.eventIds || []))];
    
    // Fetch all events at once
    const events = await prisma.event.findMany({
      where: { id: { in: allEventIds } },
      select: { id: true, name: true },
    });
    
    // Create a map for quick lookup: eventId -> eventName
    const eventMap = new Map(events.map((e) => [e.id, e.name]));
    
    const csv = toCsv(registrations, [
      { label: "Registration Code", value: "registrationCode" },
      { label: "Name", value: (r) => r.user.name },
      { label: "Email", value: (r) => r.user.email },
      { label: "College", value: "collegeName" },
      { label: "Team Name", value: "teamName" },
      { label: "Events", value: (r) => (r.eventIds || []).map((id) => eventMap.get(id) || id).join(" | ") },
      { label: "Total Amount", value: "totalAmount" },
      { label: "Transaction ID", value: "transactionId" },
      { label: "Status", value: "status" },
      { label: "Created At", value: (r) => r.createdAt.toISOString() },
    ]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=registrations.csv");
    res.send(csv);
  } catch (err) {
    console.error("Export CSV error:", err);
    res.status(500).json({ error: "Failed to export data" });
  }
});

/** PATCH /api/admin/registrations/:id/waitlist-promote - move a waitlisted reg to approved if seats exist. */
router.patch("/registrations/:id/waitlist-promote", async (req, res) => {
  try {
    const registration = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status: "approved" },
    });
    res.json({ registration });
  } catch (err) {
    console.error("Waitlist promote error:", err);
    res.status(500).json({ error: "Failed to promote registration" });
  }
});

/** POST /api/admin/registrations/:id/refund - mark a registration as refunded/cancelled. */
router.post("/registrations/:id/refund", async (req, res) => {
  try {
    const registration = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status: "rejected", rejectionReason: "Cancelled/refunded by admin" },
    });
    res.json({ registration });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ error: "Failed to process refund" });
  }
});

module.exports = router;
