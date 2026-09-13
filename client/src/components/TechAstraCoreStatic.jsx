import React from "react";

/**
 * SECTION 5C - "TechAstra Core" pure-CSS fallback.
 *
 * This is an ORIGINAL design: a central glass-like core with six smaller
 * gemstones arranged around it, each representing a different TechAstra
 * event track. It is NOT modeled on, named after, or a reproduction of
 * any third-party trademarked character or franchise symbol - see the
 * "DO NOT" note in TechAstraCore.jsx for the constraint this satisfies.
 *
 * Used in three situations (see TechAstraCore.jsx for the decision logic):
 *   1. `prefers-reduced-motion` is set -> rendered with `animated={false}`,
 *      a genuinely static single frame, no orbiting/pulsing at all.
 *   2. WebGL is unsupported, or the R3F tree throws at runtime -> rendered
 *      with `animated={true}` as the graceful fallback, so the page still
 *      has *some* life to it even without real 3D.
 *   3. `CoreWatermark.jsx` (the small header watermark) always renders
 *      this directly, `animated={false}` - it's explicitly specified as
 *      a "small, static (non-orbiting)" secondary placement, so it never
 *      needs the WebGL version at all.
 */

// Six stones, one per track, an original color set (not copied from any
// existing IP's palette). Positioned via a CSS custom property per stone
// so both the static (fixed rotation) and animated (spinning ring)
// layouts share one definition.
const STONES = [
  { color: "#22D3EE", angle: 0, label: "Technical" },
  { color: "#B565F0", angle: 60, label: "Non-Technical" },
  { color: "#F2B84B", angle: 120, label: "Flagship" },
  { color: "#34D399", angle: 180, label: "Robotics" },
  { color: "#E8495B", angle: 240, label: "Esports" },
  { color: "#4C8DF6", angle: 300, label: "Creative" },
];

export default function TechAstraCoreStatic({ size = 260, animated = true, className = "" }) {
  const orbitRadius = size * 0.42;
  const stoneSize = size * 0.11;
  const coreSize = size * 0.34;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="TechAstra Core - a glowing crystal symbol"
    >
      {/* Orbit ring - all six stones live inside this so a single
          rotation animation moves all of them together (each stone's
          own counter-rotation, applied below, keeps its individual
          facet-shape from spinning with the ring). */}
      <div
        className={`absolute inset-0 ${animated ? "animate-core-ring-spin" : ""}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {STONES.map((stone) => (
          <div
            key={stone.label}
            className="absolute left-1/2 top-1/2"
            style={{
              width: stoneSize,
              height: stoneSize,
              // Elliptical placement (not a perfect circle) - the Y
              // component is compressed to ~55%, giving the ring a
              // gentle tilt even in this flat CSS rendering, echoing the
              // "tilted elliptical orbit" of the real 3D version.
              transform: `translate(-50%, -50%) rotate(${stone.angle}deg) translateX(${orbitRadius}px) rotate(-${stone.angle}deg) scaleY(0.55)`,
            }}
          >
            <div
              className={animated ? "animate-core-stone-spin" : ""}
              style={{
                width: "100%",
                height: "100%",
                background: stone.color,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                boxShadow: `0 0 ${stoneSize * 0.9}px ${stone.color}99, 0 0 ${stoneSize * 0.3}px ${stone.color}`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Central core - a faceted, glass-like gem with a soft inner glow.
          `animate-core-breathe` gives it the spec's "heartbeat/breathing"
          1.0 -> 1.03 scale pulse; skipped entirely when animated=false. */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
          animated ? "animate-core-breathe" : ""
        }`}
        style={{
          width: coreSize,
          height: coreSize,
          clipPath: "polygon(50% 0%, 90% 20%, 100% 55%, 75% 100%, 25% 100%, 0% 55%, 10% 20%)",
          background:
            "radial-gradient(circle at 38% 30%, rgba(255,255,255,0.95) 0%, rgba(224,250,255,0.55) 25%, rgba(34,211,238,0.35) 55%, rgba(170,5,5,0.25) 100%)",
          boxShadow: "0 0 40px rgba(34,211,238,0.55), 0 0 80px rgba(170,5,5,0.25), inset 0 0 20px rgba(255,255,255,0.4)",
        }}
      />
    </div>
  );
}
