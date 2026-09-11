import React from "react";

/**
 * Recreation of the TechAstra'26 event mark: a metallic gold wordmark with
 * a spinning four-color glowing ring wrapped around the "T", inspired by
 * the official symposium logo artwork. Built as SVG + CSS so it scales
 * cleanly at any size without shipping an image asset.
 *
 * If the real exported logo file (e.g. /logo.png) is added under
 * client/public/, swap the <svg> below for an <img src="/logo.png" />
 * for pixel-perfect fidelity - everything else (sizing props, wrapper)
 * stays the same.
 */
export default function TechAstraLogo({ size = "md", showRing = true, className = "" }) {
  const dims = {
    sm: { w: 150, h: 46, font: 22 },
    md: { w: 230, h: 70, font: 34 },
    lg: { w: 380, h: 116, font: 56 },
    xl: { w: 560, h: 170, font: 82 },
  }[size] || { w: 230, h: 70, font: 34 };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dims.w, height: dims.h }}
    >
      {showRing && (
        <div
          className="absolute rounded-full animate-ring-spin"
          style={{
            width: dims.h * 0.92,
            height: dims.h * 0.92,
            left: dims.h * -0.05,
            background: "conic-gradient(from 0deg, #E5473A 0deg, #F2C230 90deg, #22C55E 180deg, #3B82F6 270deg, #E5473A 360deg)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
            filter: "drop-shadow(0 0 10px rgba(242,194,48,0.55))",
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        width={dims.w}
        height={dims.h}
        className="relative z-10"
        role="img"
        aria-label="TechAstra '26"
      >
        <defs>
          <linearGradient id="goldFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F7E3AC" />
            <stop offset="45%" stopColor="#D9A840" />
            <stop offset="100%" stopColor="#8A6A24" />
          </linearGradient>
          <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F2C230" floodOpacity="0.55" />
          </filter>
        </defs>
        <text
          x={showRing ? dims.h * 0.55 : 4}
          y={dims.h * 0.68}
          fontFamily="Orbitron, sans-serif"
          fontWeight="800"
          fontSize={dims.font}
          fill="url(#goldFill)"
          filter="url(#goldShadow)"
          letterSpacing="1"
        >
          TECHASTRA<tspan fontSize={dims.font * 0.72} dy="-4">&apos;26</tspan>
        </text>
      </svg>
    </div>
  );
}
