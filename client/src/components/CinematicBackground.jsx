import React, { useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The site's single shared video backdrop - mounted ONCE in App.jsx,
 * fixed behind the entire app shell (Navbar, every routed page,
 * Footer), including the Login route. Semi-blurred and dimmed so it
 * reads as an ambient, Rolls-Royce-style cinematic backdrop that content
 * sits on top of, not a foreground video.
 *
 * Previously the video was duplicated per page with different, drifting
 * treatments (a full-clarity full-screen video on Login, a separately
 * blurred boxed hero on Events) - that's what read as "doesn't match".
 * This component is the ONE place the look is defined; every page now
 * shares it through App.jsx instead of rendering its own copy.
 *
 * Reuses the same asset already staged for the app:
 * client/public/videos/login-core.mp4.
 */
export default function CinematicBackground() {
  const [videoFailed, setVideoFailed] = useState(false);
  const reduce = useReducedMotion();
  const showVideo = !reduce && !videoFailed;

  return (
    <div className="cinematic-bg" aria-hidden="true">
      {showVideo && (
        <video
          className="cinematic-bg-video"
          src="/videos/login-core.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
        />
      )}
      <div className="cinematic-bg-scrim" />
    </div>
  );
}
