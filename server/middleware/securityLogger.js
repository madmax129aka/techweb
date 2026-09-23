/**
 * Security event logging middleware.
 * Logs authentication failures, unauthorized access attempts, and suspicious activity.
 */

const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const securityLogPath = path.join(logDir, "security.log");
const accessLogPath = path.join(logDir, "access.log");

function formatLogEntry(type, data) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    type,
    ...data,
  }) + "\n";
}

function appendLog(filePath, entry) {
  try {
    fs.appendFileSync(filePath, entry, "utf8");
  } catch (err) {
    console.error("Failed to write security log:", err);
  }
}

/**
 * Log security events (failed logins, unauthorized access, etc.)
 */
function logSecurityEvent(type, data) {
  const entry = formatLogEntry(type, data);
  appendLog(securityLogPath, entry);
  
  // Also log to console for immediate visibility
  if (type === "FAILED_LOGIN" || type === "UNAUTHORIZED_ACCESS" || type === "RATE_LIMIT_EXCEEDED") {
    console.warn(`[SECURITY] ${type}:`, data);
  }
}

/**
 * Log general access events
 */
function logAccessEvent(data) {
  const entry = formatLogEntry("ACCESS", data);
  appendLog(accessLogPath, entry);
}

/**
 * Middleware to log failed authentication attempts
 */
function logFailedAuth(req, email = null, reason = "invalid_credentials") {
  logSecurityEvent("FAILED_LOGIN", {
    ip: req.ip || req.connection.remoteAddress,
    email: email || req.body?.email,
    reason,
    userAgent: req.headers["user-agent"],
    path: req.path,
  });
}

/**
 * Middleware to log unauthorized access attempts
 */
function logUnauthorizedAccess(req, reason = "missing_token") {
  logSecurityEvent("UNAUTHORIZED_ACCESS", {
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    role: req.user?.role,
    reason,
    path: req.path,
    method: req.method,
    userAgent: req.headers["user-agent"],
  });
}

/**
 * Middleware to log rate limit violations
 */
function logRateLimitExceeded(req, limit) {
  logSecurityEvent("RATE_LIMIT_EXCEEDED", {
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    path: req.path,
    method: req.method,
    limit,
    userAgent: req.headers["user-agent"],
  });
}

/**
 * Middleware to log suspicious activity
 */
function logSuspiciousActivity(req, activity, details = {}) {
  logSecurityEvent("SUSPICIOUS_ACTIVITY", {
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    role: req.user?.role,
    activity,
    path: req.path,
    method: req.method,
    userAgent: req.headers["user-agent"],
    ...details,
  });
}

/**
 * Middleware to log IDOR attempts (accessing resources user doesn't own)
 */
function logIDORAttempt(req, resourceType, resourceId, ownerId) {
  logSecurityEvent("IDOR_ATTEMPT", {
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    role: req.user?.role,
    resourceType,
    resourceId,
    ownerId,
    path: req.path,
    method: req.method,
  });
}

/**
 * Middleware wrapper for routes to log security events on errors
 */
function withSecurityLogging(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      if (err.message.includes("Unauthorized") || err.message.includes("Forbidden")) {
        logUnauthorizedAccess(req, err.message);
      }
      next(err);
    }
  };
}

module.exports = {
  logSecurityEvent,
  logAccessEvent,
  logFailedAuth,
  logUnauthorizedAccess,
  logRateLimitExceeded,
  logSuspiciousActivity,
  logIDORAttempt,
  withSecurityLogging,
};
