import React, { useEffect, useRef, useState } from "react";
import CinematicImage from "./CinematicImage";

/**
 * SECTION 5F - event detail hero background: a short, muted, looping
 * video where one is available, with the static banner image as both the
 * <video>'s poster frame AND the fallback if the video 404s, hasn't been
 * added yet, or the user prefers reduced motion. See lib/eventVideos.js
 * for the "no real .mp4 files exist in this sandbox yet" caveat - this
 * component is written to degrade to the plain image with zero visual
 * side effects (no broken-video icon, no blank space) until real files
 * are dropped in.
 *
 * Lazy-loads: the <video>'s `src` is only set once this component's
 * section actually scrolls into view (IntersectionObserver), per the
 * brief - avoids spending bandwidth on a hero video below the fold or
 * one the visitor never scrolls to (e.g. if they register straight from
 * the sticky sub-nav's Register tab without reading the rest of the page).
 */
export default function EventHeroMedia({ videoSrc, imageSrc, alt, scrim = "full" }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  useEffect(() => {
    if (!containerRef.current || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // only need to trigger the lazy-load once
        }
      },
      { rootMargin: "200px" } // start loading slightly before it's fully on-screen
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const showVideo = inView && !videoFailed && !reducedMotion && videoSrc;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-void">
      {/* Static image - always rendered as the base layer/poster/fallback.
          CinematicImage already handles its own load-fade + contrast
          scrim (Section 5E/5G), so video is strictly additive on top. */}
      <CinematicImage src={imageSrc} alt={alt} zoomOnHover={false} scrim={showVideo ? "none" : scrim} />

      {showVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={imageSrc}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Video needs its own scrim layer too (CinematicImage's scrim was
          suppressed above while the video renders, since it lives inside
          the <img> layer underneath the video, not on top of it). */}
      {showVideo && scrim === "full" && <div className="absolute inset-0 pointer-events-none bg-black/55" />}
      {showVideo && scrim === "bottom" && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "45%",
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.65) 55%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
