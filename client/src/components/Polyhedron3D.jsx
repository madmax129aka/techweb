import React from "react";

/**
 * A pure CSS 3D rotating faceted centerpiece for the hero section.
 * Built from six absolutely-positioned faces inside a preserve-3d
 * container, each translated forward along its own axis and continuously
 * rotated - a lightweight "3D gem" effect with no WebGL/three.js
 * dependency required (none of which could be installed/tested in this
 * sandbox, so this CSS-only approach guarantees it actually renders).
 *
 * Each face is tinted with one VISION pillar color, tying the shape
 * directly to the V-I-S-I-O-N acronym.
 */
const FACES = [
  { color: "rgba(139, 92, 246, 0.55)", border: "#8B5CF6", transform: "rotateY(0deg) translateZ(90px)" },
  { color: "rgba(61, 217, 235, 0.55)", border: "#3DD9EB", transform: "rotateY(60deg) translateZ(90px)" },
  { color: "rgba(52, 211, 153, 0.55)", border: "#34D399", transform: "rotateY(120deg) translateZ(90px)" },
  { color: "rgba(244, 114, 182, 0.55)", border: "#F472B6", transform: "rotateY(180deg) translateZ(90px)" },
  { color: "rgba(242, 194, 48, 0.55)", border: "#F2C230", transform: "rotateY(240deg) translateZ(90px)" },
  { color: "rgba(59, 130, 246, 0.55)", border: "#3B82F6", transform: "rotateY(300deg) translateZ(90px)" },
];

export default function Polyhedron3D({ size = 200, className = "" }) {
  return (
    <div
      className={`perspective-1200 ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="preserve-3d animate-rotate-3d"
        style={{ width: size, height: size, position: "relative" }}
      >
        {FACES.map((face, i) => (
          <div
            key={i}
            className="preserve-3d absolute inset-0 flex items-center justify-center backdrop-blur-sm"
            style={{
              background: face.color,
              border: `1px solid ${face.border}`,
              transform: face.transform,
              boxShadow: `0 0 30px ${face.color}`,
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: face.border, boxShadow: `0 0 12px ${face.border}` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
