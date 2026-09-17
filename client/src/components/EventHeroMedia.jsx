import React, { useEffect, useRef, useState } from "react";
import CinematicImage from "./CinematicImage";

/**
 * SECTION 5F - event detail hero background: a short, muted, looping
 * video where one is available, with the static banner image as both the
 * <video>'s poster frame AND the fallback if the video 404s, hasn't been
 * added yet, or the user prefers reduced motion. Real .mp4 files now
 * exist for at least one event (see lib/eventVideos.js + the videos/
 * folder) - this component degrades to the plain image with zero visual
 * side effects (no broken-video icon, no blank space) for every event
 * that doesn't have one yet.
 *
 * `videoBlur` (new): softens the video layer itself with `filter:
 * blur(3px) brightness(0.55)`, for the Event Detail page's Phantom-style
 * hero, which wants the footage to read as atmospheric background
 * rather than sharp foreground video.
 *
 * BUGFIX ("video is not rendering"): the video used to only become
 * visible after its `onCanPlay` event fired. That event is not fired
 * reliably by every browser for a <video> that's conditionally mounted
 * into the DOM (rather than present at parse time) while also carrying
 * autoplay+muted+loop - so the element could load and even start
 * playing while remaining stuck at `opacity-0` forever, with zero
 * visible difference from "no video ran at all" (the scrim renders the
 * same either way). Fixed by rendering the video fully visible
 * immediately and additionally calling `.play()` explicitly (the
 * `autoPlay` attribute alone has the same reliability gap for
 * dynamically-mounted elements in some browsers).
 *
 * Lazy-loads: the <video>'s `src` is only set once this component's
 * section actually scrolls into view (IntersectionObserver), per the
 * brief - avoids spending bandwidth on a hero video below the fold or
 * one the visitor never scrolls to (e.g. if they register straight from
 * the sticky sub-nav's Register tab without reading the rest of the page).
 */
export default function EventHeroMedia({ videoSrc, imageSrc, alt, scrim = "full", videoBlur = false }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
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

  // Explicit `.play()` call once the <video> element exists and has a
  // source. The `autoPlay` attribute alone is not reliably honored by
  // every browser for an element that's CONDITIONALLY rendered (mounted
  // only once `showVideo` flips true, i.e. after this component's
  // first render) rather than present in the page's initial markup -
  // some browsers only actually attempt to autoplay elements that exist
  // at parse time. Calling `.play()` directly covers that gap.
  //
  // ROOT CAUSE OF THE ACTUAL BUG (confirmed via DevTools Network tab:
  // the request for the .mp4 succeeds every time - 206 Partial Content,
  // correct size - so this was never a loading/network problem at all.
  // The video loads fine and then just sits paused on its first frame,
  // which looks visually near-identical to the static poster image of
  // the same three people, so it LOOKED like "nothing is happening"):
  // React applies the `muted` attribute as a DOM property, but some
  // browsers evaluate an autoplay call's mute-state at the moment
  // `.play()` is invoked, not whenever React got around to setting the
  // property - there's a timing gap between React committing the
  // `muted` prop and this effect firing `.play()`. If the element isn't
  // ALREADY definitively muted at the exact instant `.play()` runs, the
  // browser's autoplay policy rejects the play() promise, which was
  // being silently swallowed here - the video stayed paused forever
  // with zero visible error. Setting `videoRef.current.muted = true`
  // directly on the DOM node, synchronously, in the same tick as the
  // `.play()` call - not relying on the JSX `muted` attribute alone -
  // closes that timing gap and is the standard fix for this exact
  // React + autoplay interaction.
  useEffect(() => {
    if (showVideo && videoRef.current) {
      const el = videoRef.current;
      el.muted = true;
      el.defaultMuted = true;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err) => {
          // Genuinely blocked by the browser (rare once muted is forced
          // this way, but still possible) - not a load failure, so this
          // deliberately does NOT set videoFailed (that would fall back
          // to the plain image entirely). The poster frame already
          // covers this visually. Logged rather than fully silent, so a
          // real block is at least visible in the console instead of
          // being an invisible dead end again.
          console.warn("EventHeroMedia: video play() was blocked", err);
        });
      }
    }
  }, [showVideo]);

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
          preload="auto"
          onError={() => setVideoFailed(true)}
          // Rendered fully visible immediately - no opacity gate behind
          // a load event. Previously this stayed at `opacity-0` until an
          // `onCanPlay` handler fired, which is what caused the "video
          // is not rendering" bug: that event doesn't fire reliably in
          // every browser for an element that's conditionally mounted
          // + autoplaying + muted + looping all at once, so the video
          // could be fully loaded and playing while still invisible,
          // with the scrim underneath making that failure look
          // identical to "no video at all". The poster frame (same
          // image as the static fallback) covers the brief instant
          // before the first frame paints, so there's no flash of
          // wrong content either way.
          className="absolute inset-0 w-full h-full object-cover"
          // `videoBlur` applies the soft/atmospheric treatment to the
          // FOOTAGE ITSELF (not just a dark overlay on top of it), per
          // the Rolls-Royce reference brief: hero imagery there always
          // sits slightly soft/desaturated behind the text, not sharp
          // foreground video with a dark scrim as the only softening.
          // Kept as an opt-in prop (default false) rather than always-on,
          // since the site's OTHER video surface - the shared
          // CinematicBackground - already has its own independently
          // tuned blur and this component is reused wherever a sharp,
          // unblurred hero video might still be wanted later.
          style={videoBlur ? { filter: "blur(3px) brightness(0.55)" } : undefined}
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
