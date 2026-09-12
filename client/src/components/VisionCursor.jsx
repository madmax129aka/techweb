import React, { useEffect, useRef, useState } from "react";

/**
 * Custom cursor styled as Vision's (Avengers) Mind Stone - a small
 * glowing hexagonal gem that trails the pointer with a soft lag, and
 * expands into a ring when hovering anything clickable.
 *
 * WHY NOT A NATIVE `cursor: url(...)` IMAGE:
 * A literal image-cursor (like a steering-wheel icon) is fragile across
 * browsers - Safari silently clamps cursor images to 32x32px, some
 * browsers ignore SVG data-URIs as cursors entirely, and there's no way
 * to animate a native cursor (pulse/glow/hover-expand) at all. Real
 * "premium site" custom cursors (the technique sites like this are
 * actually built with) are a plain DOM element that JS moves to follow
 * the pointer - which is what this component does. It renders reliably
 * everywhere and can glow/pulse/expand like the reference.
 *
 * Automatically disables itself on touch/coarse-pointer devices (phones,
 * tablets) via a matchMedia check, since there is no mouse to track and
 * a hidden native cursor would leave touch users with no cursor at all.
 */
export default function VisionCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia?.("(pointer: fine)").matches;
    if (!isFinePointer) return; // touch/coarse pointer - leave native cursor alone

    setEnabled(true);

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let frame;
    let lastTime = performance.now();

    // Position tracking is intentionally the ONLY thing this handler does.
    // It used to also run `e.target.closest(...)` on every single mousemove
    // event (which can fire 100+ times/sec) to detect hover state - that
    // DOM-tree walk is real work, and doing it synchronously in the
    // highest-frequency event handler on the page was blocking the main
    // thread just enough to make the cursor visibly stutter instead of
    // gliding. Hover detection has been moved to mouseover/mouseout below,
    // which only fire when the pointer actually crosses into/out of an
    // element - not on every pixel of movement.
    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const onOver = (e) => {
      const interactive = e.target.closest?.("a, button, [role='button'], input, select, textarea, .cursor-hover");
      if (interactive) setHovering(true);
    };
    const onOut = (e) => {
      const interactive = e.target.closest?.("a, button, [role='button'], input, select, textarea, .cursor-hover");
      // Only clear hovering if we're not moving to another element inside
      // the same interactive ancestor (avoids flicker on nested elements).
      if (interactive && !interactive.contains(e.relatedTarget)) setHovering(false);
    };

    const onLeaveWindow = () => setVisible(false);

    // Time-based easing (rather than a fixed per-frame multiplier) keeps
    // the trailing ring's speed consistent regardless of the actual frame
    // rate - a fixed 0.18-per-frame factor effectively moves slower on a
    // 30fps tab (throttled/background) and faster on a 144Hz display,
    // which reads as inconsistent/jittery motion between devices.
    const tick = (time) => {
      const dt = Math.min(time - lastTime, 50); // clamp so tab-switches don't cause a big jump
      lastTime = time;
      const ease = 1 - Math.pow(1 - 0.22, dt / 16.67);

      // dot tracks instantly, ring trails with easing for a soft premium lag
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      ringPos.x += (pos.x - ringPos.x) * ease;
      ringPos.y += (pos.y - ringPos.y) * ease;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseleave", onLeaveWindow);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      {/* Outer trailing ring - widens on hover. will-change hints the
          browser to promote this to its own compositing layer up front,
          instead of doing that promotion (and a layout/paint) the first
          time the transform changes - which otherwise shows up as a
          one-frame hitch right as the cursor starts moving. */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border transition-[width,height,border-color] duration-300 ease-out"
        style={{
          width: hovering ? 52 : 34,
          height: hovering ? 52 : 34,
          borderColor: hovering ? "rgba(34,211,238,0.9)" : "rgba(34,211,238,0.5)",
          borderWidth: 1.5,
          boxShadow: hovering
            ? "0 0 22px rgba(34,211,238,0.55), inset 0 0 14px rgba(34,211,238,0.3)"
            : "0 0 10px rgba(34,211,238,0.3)",
          willChange: "transform",
        }}
      />
      {/* Inner Mind Stone gem - hexagonal, pulsing cyan-on-crimson core */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 flex items-center justify-center"
        style={{ width: 14, height: 14, willChange: "transform" }}
      >
        <div
          className="animate-gold-pulse"
          style={{
            width: 10,
            height: 10,
            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
            background: "radial-gradient(circle at 35% 30%, #eafeff 0%, #7de8fa 35%, #22d3ee 65%, #aa0505 100%)",
            boxShadow: "0 0 12px rgba(34,211,238,0.85)",
          }}
        />
      </div>
    </div>
  );
}
