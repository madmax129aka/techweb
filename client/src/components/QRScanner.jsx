import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const SCANNER_ELEMENT_ID = "qr-scanner-viewport";

/** Translates raw getUserMedia/html5-qrcode errors into an actionable message. */
function describeCameraError(err) {
  const name = err?.name || "";
  const message = String(err?.message || err || "");

  if (name === "NotAllowedError" || name === "PermissionDeniedError" || /permission denied/i.test(message)) {
    return "Camera permission was denied. Click the camera/lock icon in your browser's address bar, allow camera access for this site, then reload and try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || /no camera devices found/i.test(message)) {
    return "No camera was found on this computer. If you're on a desktop with no webcam, use the manual search option instead.";
  }
  if (name === "NotReadableError" || name === "TrackStartError" || /could not start video source/i.test(message)) {
    return "Your camera is already in use by another app or browser tab (e.g. Zoom, Teams, another site). Close it and try again.";
  }
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return "This camera doesn't support the requested settings. Try a different camera if one is available.";
  }
  if (name === "SecurityError") {
    return "Camera access was blocked for security reasons. Make sure you're on HTTPS or http://localhost.";
  }
  return `Could not access the camera (${name || "unknown error"}). Check permissions, close other apps using the camera, and try again — or use manual search instead.`;
}

/**
 * Full-screen-modal-friendly camera QR scanner.
 * Calls onScan(decodedText) once per successful decode, then briefly pauses
 * to avoid firing the same scan multiple times in a row.
 */
export default function QRScanner({ onScan, active = true }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    // A secure context (HTTPS, or http://localhost) is required for camera
    // access at all - on plain http://<lan-ip> the browser blocks
    // getUserMedia outright, before any permission prompt even appears.
    if (!window.isSecureContext) {
      setError(
        "Camera access requires a secure connection. Open this page over HTTPS, or via http://localhost (not a plain IP address like http://192.168.x.x), then try again."
      );
      return;
    }

    let cancelled = false;
    const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 240, height: 240 } };
    const onSuccess = (decodedText) => {
      if (pausedRef.current) return;
      pausedRef.current = true;
      onScan(decodedText);
      setTimeout(() => {
        pausedRef.current = false;
      }, 2000);
    };
    const onDecodeError = () => {
      // decode errors fire continuously while no QR is in frame - ignore
    };

    // Prefer the rear/back camera (ideal for phones/tablets at a check-in
    // desk). Most laptops only expose a single front-facing webcam and have
    // no "environment" camera at all, which makes a strict facingMode
    // constraint fail (silently, in some browsers) - so we fall back to
    // whatever camera is actually available instead of erroring out.
    html5QrCode
      .start({ facingMode: "environment" }, config, onSuccess, onDecodeError)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(async () => {
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (!cameras || cameras.length === 0) {
            throw new Error("No camera devices found on this computer.");
          }
          // Fall back to the first available camera (typically the laptop webcam).
          await html5QrCode.start(cameras[0].id, config, onSuccess, onDecodeError);
          if (!cancelled) setReady(true);
        } catch (err) {
          console.error("QR scanner start error:", err);
          if (!cancelled) setError(describeCameraError(err));
        }
      });

    return () => {
      cancelled = true;
      html5QrCode.stop().catch(() => {});
      html5QrCode.clear().catch(() => {});
    };
  }, [active, onScan]);

  return (
    <div className="relative">
      <div id={SCANNER_ELEMENT_ID} className="w-full rounded-xl overflow-hidden bg-black min-h-[280px]" />
      {ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative w-56 h-56 border-2 border-gold/70 rounded-xl overflow-hidden">
            <div className="absolute left-0 right-0 h-0.5 bg-gold animate-scanline" />
          </div>
        </div>
      )}
      {error && (
        <p className="text-danger text-sm mt-3 text-center">{error}</p>
      )}
    </div>
  );
}
