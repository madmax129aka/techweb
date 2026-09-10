const express = require("express");
const { buildUpiLink, generateQrDataUrl } = require("../utils/qr");

const router = express.Router();

/**
 * GET /api/upi/qr?amount=250&note=SYM2026-0042
 * Returns a base64 PNG data URL of the UPI payment QR, prefilled with the
 * amount and a reference note (typically the registration code).
 */
router.get("/qr", async (req, res) => {
  try {
    const { amount, note } = req.query;
    if (!amount) return res.status(400).json({ error: "amount is required" });

    const link = buildUpiLink({
      payeeId: process.env.UPI_PAYEE_ID || "college@upi",
      payeeName: process.env.UPI_PAYEE_NAME || "TechAstra Symposium",
      amount,
      note: note || "TechAstra Registration",
    });

    const qrDataUrl = await generateQrDataUrl(link);
    res.json({ upiLink: link, qrDataUrl });
  } catch (err) {
    console.error("UPI QR error:", err);
    res.status(500).json({ error: "Failed to generate payment QR" });
  }
});

module.exports = router;
