import React from "react";

/**
 * "Vision Core" - a genuinely shaded 3D energy orb with tilted, orbiting
 * rings (the classic "Saturn's rings" illusion: a circle rotated on the
 * X-axis becomes an ellipse in perspective, then spinning it on the
 * Y-axis makes it sweep believably in front of and behind the sphere).
 *
 * This is built entirely from CSS (radial-gradient shading + real 3D
 * transforms with perspective/preserve-3d), not clipped flat shapes -
 * no WebGL/three.js dependency, since none could be installed or
 * test-rendered in this sandbox. The shading (offset highlight, dark
 * rim, ambient shadow) is what actually reads as "3D" rather than a
 * flat cutout, the same trick used for CSS-only sphere illustrations.
 */
export default function Polyhedron3D({ size = 240, className = "" }) {
  const sphereSize = size * 0.46;

  const rings = [
    { tiltX: 78, color: "200, 30, 58", border: "#FF4D6A", speed: "10s", z: 10 },
    { tiltX: 68, color: "217, 168, 64", border: "#F2D48A", speed: "16s", z: 0 },
    { tiltX: 74, color: "34, 211, 238", border: "#7DE8FA", speed: "13s", z: -10 },
  ];

  return (
    <div
      className={`perspective-1600 relative ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="preserve-3d relative"
        style={{ width: size, height: size, transform: "rotateX(6deg)" }}
      >
        {/* Ambient contact shadow beneath the orb, grounds it in space */}
        <div
          className="absolute rounded-full"
          style={{
            width: sphereSize * 1.3,
            height: sphereSize * 0.35,
            left: "50%",
            top: "62%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 75%)",
          }}
        />

        {/* Orbiting tilted rings - each an ellipse (circle + rotateX) that
            continuously spins on Y, sweeping in front of/behind the sphere */}
        {rings.map((ring, i) => (
          <div
            key={i}
            className="preserve-3d absolute rounded-full"
            style={{
              width: sphereSize * 1.9,
              height: sphereSize * 1.9,
              left: "50%",
              top: "50%",
              marginLeft: -(sphereSize * 1.9) / 2,
              marginTop: -(sphereSize * 1.9) / 2,
              border: `1.5px solid rgba(${ring.color}, 0.9)`,
              boxShadow: `0 0 18px rgba(${ring.color}, 0.55), inset 0 0 18px rgba(${ring.color}, 0.25)`,
              "--tilt": `${ring.tiltX}deg`,
              animation: `ringOrbit ${ring.speed} linear infinite`,
              animationDelay: `${i * -2}s`,
            }}
          >
            {/* a bright bead riding the ring, like an orbiting particle */}
            <span
              className="absolute rounded-full"
              style={{
                width: 7,
                height: 7,
                left: "50%",
                top: -3.5,
                background: ring.border,
                boxShadow: `0 0 10px ${ring.border}, 0 0 20px ${ring.border}`,
              }}
            />
          </div>
        ))}

        {/* The core sphere itself - shaded like a real lit glass/energy
            orb: bright offset highlight (light source), mid-tone body,
            dark shadow rim, plus a soft outer glow and a slow-rotating
            specular sheen to suggest it's alive/spinning. */}
        <div
          className="absolute rounded-full"
          style={{
            width: sphereSize,
            height: sphereSize,
            left: "50%",
            top: "50%",
            marginLeft: -sphereSize / 2,
            marginTop: -sphereSize / 2,
            background:
              "radial-gradient(circle at 32% 28%, #fff9e6 0%, #ffe9a8 14%, #f2c230 34%, #c81e3a 68%, #3a0a12 100%)",
            boxShadow:
              "inset -14px -14px 40px rgba(0,0,0,0.55), inset 10px 10px 26px rgba(255,255,255,0.35), 0 0 50px rgba(217,168,64,0.55), 0 0 90px rgba(200,30,58,0.35)",
          }}
        >
          {/* rotating specular sheen */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden animate-rotate-3d"
            style={{ mixBlendMode: "overlay", opacity: 0.5 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "conic-gradient(from 90deg, transparent 0deg, rgba(255,255,255,0.5) 20deg, transparent 60deg, transparent 300deg, rgba(255,255,255,0.3) 340deg, transparent 360deg)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
