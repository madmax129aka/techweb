import React, { useRef, useCallback } from "react";

/**
 * Wraps children in a card that tilts in 3D following the pointer,
 * plus a subtle "glare" highlight that moves with it - a classic premium
 * product-showcase effect, built with plain CSS 3D transforms so it needs
 * no extra dependency (no react-tilt/vanilla-tilt/three.js required).
 *
 * Usage: <TiltCard className="..." glowClass="shadow-vision-v">...</TiltCard>
 */
export default function TiltCard({ children, className = "", glowClass = "", maxTilt = 10 }) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const frameRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0 - 1
      const y = (e.clientY - rect.top) / rect.height; // 0 - 1

      const rotateY = (x - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - y) * maxTilt * 2;

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        if (glareRef.current) {
          glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.16), transparent 55%)`;
        }
      });
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    if (glareRef.current) glareRef.current.style.background = "transparent";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card relative glass-premium rounded-2xl overflow-hidden ${glowClass} ${className}`}
    >
      <div ref={glareRef} className="absolute inset-0 pointer-events-none transition-opacity duration-200" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
