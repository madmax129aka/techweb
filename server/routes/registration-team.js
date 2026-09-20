const express = require("express");
const XLSX = require("xlsx");
const prisma = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware - registration_team or master_admin only
router.use(requireAuth, (req, res, next) => {
  if (req.user.role !== "registration_team" && req.user.role !== "master_admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
});

/**
 * GET /api/registration-team/export/:eventId
 * Export all participants for a specific event as Excel (.xlsx)
 * Columns: name, email, phone, college, registerNo, team name, team members, status, transactionId, totalAmount, createdAt
 */
router.get("/export/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Find all registrations that include this event
    const registrations = await prisma.registration.findMany({
      where: {
        eventIds: {
          has: eventId,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Collect all unique event IDs from all registrations
    const allEventIds = [...new Set(registrations.flatMap((r) => r.eventIds || []))];
    
    // Fetch all events at once
    const events = await prisma.event.findMany({
      where: { id: { in: allEventIds } },
      select: { id: true, name: true },
    });
    
    // Create a map for quick lookup: eventId -> eventName
    const eventMap = new Map(events.map((e) => [e.id, e.name]));

    // Prepare data rows for Excel
    const rows = registrations.map((reg) => {
      // Format team members if it's a team event
      let teamMembersStr = "";
      if (reg.teamMembers && Array.isArray(reg.teamMembers)) {
        teamMembersStr = reg.teamMembers
          .map((member) => `${member.name} (${member.regNo || "N/A"})`)
          .join("; ");
      }

      // Format events - map IDs to names
      const eventsStr = (reg.eventIds || [])
        .map((id) => eventMap.get(id) || id)
        .join(" | ");

      return {
        Name: reg.user.name || "",
        Email: reg.user.email || "",
        Phone: reg.user.phone || "",
        College: reg.collegeName || "",
        "Register No": reg.registerNo || "",
        "Team Name": reg.teamName || "",
        "Team Members": teamMembersStr,
        Events: eventsStr,
        Status: reg.status || "",
        "Transaction ID": reg.transactionId || "",
        "Total Amount": reg.totalAmount || 0,
        "Registration Date": reg.createdAt
          ? new Date(reg.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "",
        "Registration Code": reg.registrationCode || "",
      };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 40 }, // College
      { wch: 15 }, // Register No
      { wch: 25 }, // Team Name
      { wch: 50 }, // Team Members
      { wch: 40 }, // Events
      { wch: 12 }, // Status
      { wch: 20 }, // Transaction ID
      { wch: 12 }, // Total Amount
      { wch: 20 }, // Registration Date
      { wch: 20 }, // Registration Code
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Set response headers for file download
    const filename = `${event.name.replace(/[^a-z0-9]/gi, "-")}-participants-${Date.now()}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (err) {
    console.error("Export event participants error:", err);
    res.status(500).json({ error: "Failed to export participants" });
  }
});

module.exports = router;
