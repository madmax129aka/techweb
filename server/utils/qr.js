const QRCode = require("qrcode");

/**
 * Builds a UPI deep-link string for a prefilled payment request.
 * No external API call is required - this is a plain URI scheme
 * that UPI apps (GPay/PhonePe/Paytm/etc.) recognise on Android.
 */
function buildUpiLink({ payeeId, payeeName, amount, note }) {
  const params = new URLSearchParams({
    pa: payeeId,
    pn: payeeName,
    am: Number(amount).toFixed(2),
    tn: note,
    cu: "INR",
  });
  return `upi://pay?${params.toString()}`;
}

/** Returns a base64 data-URL PNG for any string payload. */
async function generateQrDataUrl(payload) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}

module.exports = { buildUpiLink, generateQrDataUrl };
