import React from "react";

/**
 * "Vision Core" - a glowing power-core centerpiece for the hero, styled
 * after an arc-reactor / mind-stone rather than a flat wireframe shape.
 * Built entirely from CSS (radial gradients + 3D transforms) so it needs
 * no WebGL/three.js dependency - none of which could be installed or
 * test-rendered in this sandbox, so a pure-CSS approach guarantees it
 * actually renders with real depth instead of a flat cutout.
 *
 * Structure:
 *  - a pulsing gradient core (crimson -> gold -> white-hot center)
 *  - a rotating crystalline shell of solid, gradient-filled facets in
 *    true 3D space (preserve-3d + translateZ), each facet a mini diamond
 *    with its own highlight/shadow so it reads as a solid gem, not an
 *    outline
 *  - a thin outer containment ring (echoes the TechAstra logo's ring)
 */
const FACETS = [
  { hue: "#C81E3A", glow: "rgba(200,30,58,0.6)", rot: 0 },
  { hue: "#D9A840", glow: "rgba(217,168,64,0.6)", rot: 60 },
  { hue: "#22D3EE", glow: "rgba(34,211,238,0.6)", rot: 120 },
  { hue: "#C81E3A", glow: "rgba(200,30,58,0.6)", rot: 180 },
  { hue: "#D9A840", glow: "rgba(217,168,64,0.6)", rot: 240 },
  { hue: "#22D3EE", glow: "rgba(34,211,238,0.6)", rot: 300 },
];

export default function Polyhedron3D({ size = 220, className = "" }) {
  const facetSize = size * 0.42;
  const radius = size * 0.36;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer containment ring, echoing the logo's ring motif */}
      <div
        className="absolute rounded-full animate-ring-spin"
        style={{
          width: size,
          height: size,
          background: "conic-gradient(from 0deg, #C81E3A 0deg, #D9A840 120deg, #22D3EE 240deg, #C81E3A 360deg)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
          opacity: 0.65,
        }}
      />

      {/* Glowing power core */}
      <div
        className="absolute rounded-full animate-gold-pulse"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FFE9A8 18%, #D9A840 40%, #C81E3A 70%, #7A1220 100%)",
          boxShadow: "0 0 60px rgba(217,168,64,0.65), 0 0 120px rgba(200,30,58,0.35)",
        }}
      />

      {/* Rotating crystalline shell */}
      <div className="perspective-1200" style={{ width: size, height: size, position: "absolute" }}>
        <div className="preserve-3d animate-rotate-3d" style={{ width: size, height: size, position: "relative" }}>
          {FACETS.map((f, i) => (
            <div
              key={i}
              className="preserve-3d absolute"
              style={{
                width: facetSize,
                height: facetSize,
                left: `calc(50% - ${facetSize / 2}px)`,
                top: `calc(50% - ${facetSize / 2}px)`,
                transform: `rotateY(${f.rot}deg) translateZ(${radius}px)`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(150deg, #ffffff33 0%, ${f.hue} 45%, #00000066 100%)`,
                  border: `1px solid ${f.hue}`,
                  boxShadow: `0 0 24px ${f.glow}, inset 0 0 12px rgba(255,255,255,0.25)`,
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
