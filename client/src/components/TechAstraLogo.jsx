import React, { useState } from "react";

/**
 * The official TechAstra'26 event mark - gold metallic wordmark with the
 * spinning four-color ring baked into the artwork (client/public/logo.png).
 * Falls back to an SVG/CSS recreation if the image file is ever missing,
 * so the navbar/hero never break.
 */
export default function TechAstraLogo({ size = "md", showGlow = true, className = "" }) {
  const [imgFailed, setImgFailed] = useState(false);

  // Matches the real logo's aspect ratio (725x344 ≈ 2.11:1)
  const dims = {
    sm: { w: 140, h: 66, font: 20 },
    md: { w: 210, h: 100, font: 30 },
    lg: { w: 340, h: 161, font: 48 },
    xl: { w: 520, h: 246, font: 74 },
  }[size] || { w: 210, h: 100, font: 30 };

  if (!imgFailed) {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: dims.w, height: dims.h }}
      >
        {showGlow && (
          <div
            className="absolute inset-0 -z-10 blur-2xl opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(242,194,48,0.35) 0%, rgba(229,71,58,0.15) 45%, transparent 75%)",
            }}
          />
        )}
        <img
          src="/logo.png"
          alt="TechAstra '26"
          width={dims.w}
          height={dims.h}
          className="relative z-10 w-full h-full object-contain"
          style={{ filter: "drop-shadow(0 0 14px rgba(242,194,48,0.4))" }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // Fallback recreation (only rendered if /logo.png fails to load)
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dims.w, height: dims.h }}
    >
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
          x={dims.h * 0.55}
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
