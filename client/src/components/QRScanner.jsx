import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const SCANNER_ELEMENT_ID = "qr-scanner-viewport";

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
            throw new Error("No camera devices found");
          }
          // Fall back to the first available camera (typically the laptop webcam).
          await html5QrCode.start(cameras[0].id, config, onSuccess, onDecodeError);
          if (!cancelled) setReady(true);
        } catch (err) {
          console.error("QR scanner start error:", err);
          if (!cancelled) {
            setError(
              "Could not access a camera. Grant camera permission in your browser, close any other app/tab using the camera, and try again — or use manual search instead."
            );
          }
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
          <div className="relative w-56 h-56 border-2 border-cyan/70 rounded-xl overflow-hidden">
            <div className="absolute left-0 right-0 h-0.5 bg-cyan animate-scanline" />
          </div>
        </div>
      )}
      {error && (
        <p className="text-danger text-sm mt-3 text-center">{error}</p>
      )}
    </div>
  );
}
