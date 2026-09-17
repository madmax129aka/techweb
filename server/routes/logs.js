const express = require("express");

const router = express.Router();

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

/**
 * POST /api/logs/client
 * The frontend posts every click (and a few other UI events) here via
 * client/src/lib/clickLogger.js. This is the bridge that makes browser
 * activity visible in the SAME terminal where `npm run dev` (the backend)
 * is running - browser console.log() output never reaches that terminal
 * on its own, since the browser tab and the Node process are two entirely
 * separate processes with no shared stdout.
 *
 * Body: { type, target, path, page, timestamp, meta? }
 * Intentionally unauthenticated and side-effect-free (just logs) so it
 * works even for logged-out visitors browsing the public pages.
 */
router.post("/client", (req, res) => {
  try {
    const { type = "event", target = "", page = "", meta } = req.body || {};
    const time = new Date().toLocaleTimeString();

    console.log(
      `${colors.dim}[${time}]${colors.reset} ${colors.cyan}CLIENT${colors.reset} ${colors.yellow}${type}${colors.reset} → ${target}${page ? `  ${colors.dim}(${page})${colors.reset}` : ""}${meta ? `  ${colors.dim}${JSON.stringify(meta)}${colors.reset}` : ""}`
    );

    res.status(204).end();
  } catch (err) {
    console.error("Client log ingest error:", err);
    res.status(204).end(); // never fail the page over a logging issue
  }
});

module.exports = router;
