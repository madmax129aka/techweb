import React from "react";
import TechAstraCoreStatic from "./TechAstraCoreStatic";

/**
 * SECTION 5C - secondary placement: "a small, static (non-orbiting)
 * version of just the core gem as a subtle corner watermark in the
 * header, present across all pages."
 *
 * Deliberately always renders TechAstraCoreStatic with animated={false} -
 * this is specified as static/non-orbiting outright, so there's no
 * WebGL path, no fallback matrix, and no error boundary needed here at
 * all (nothing to fail). Kept as its own tiny wrapper component (rather
 * than every caller reaching for TechAstraCoreStatic directly) so the
 * "this is the header watermark, sized and dimmed for that specific
 * context" intent is named and easy to find/reuse.
 */
export default function CoreWatermark({ size = 34, className = "" }) {
  return (
    <div className={`opacity-70 pointer-events-none ${className}`}>
      <TechAstraCoreStatic size={size} animated={false} />
    </div>
  );
}
