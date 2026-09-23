import React, { useEffect, useRef, useState } from "react";
import CinematicImage from "./CinematicImage";

/**
 * SECTION 5F - event detail hero background: a short, muted, looping
 * video where one is available. The static banner image renders ONLY
 * as a genuine fallback - when there's no video to show at all (no
 * video src for this event, reduced motion, or the video 404s/errors) -
 * NOT as a second layer sitting behind an already-working video (see
 * the fix note further down for why that distinction matters). The
 * video does NOT use the `poster` attribute - see the fix note further
 * down for why.
 *
 * `videoBlur` (new): softens the video layer itself with `filter:
 * blur(3px) brightness(0.55)`, for the Event Detail page's Phantom-style
 * hero, which wants the footage to read as atmospheric background
 * rather than sharp foreground video.
 *
 * ROOT-CAUSE FIX ("video is not loading" - persisted across multiple
 * prior attempts at the SAME class of fix, so this is a different
 * approach, not another tweak to the old one):
 *
 * The previous version only mounted the <video> element into the DOM
 * AFTER an IntersectionObserver fired (`{showVideo && <video ... />}`,
 * where `showVideo` depended on `inView`). That is a real, independently
 * documented cross-browser autoplay-reliability gap: browsers are most
 * permissive about honoring autoplay for elements present at INITIAL
 * page parse, and measurably less consistent for a <video> tag injected
 * into the DOM later via JS/React state - even when muted, even when
 * `.play()` is called explicitly (both of those were already tried in
 * an earlier fix and still weren't reliable enough, which is the actual
 * signal that the conditional-mount PATTERN itself was the problem, not
 * a missing mute/play detail within it).
 *
 * The IntersectionObserver's job was to lazy-load a video that's below
 * the fold, to save bandwidth on a clip the visitor might never scroll
 * to. But THIS video is the Hero - the very first thing rendered on the
 * page, already in the viewport at initial load. There was never
 * anything to lazily defer here; the observer was solving a problem
 * that does not exist for an above-the-fold hero, while being the exact
 * mechanism making autoplay unreliable.
 *
 * Fix: render the <video> unconditionally, from the component's very
 * first render (still gated by `!reducedMotion` and `!videoFailed`, and
 * still falling back to the plain static image if the src ever errors),
 * with `muted`/`autoPlay`/`playsInline` present as literal attributes at
 * mount time rather than layered on after the fact.
 */
export default function EventHeroMedia({ videoSrc, imageSrc, alt, scrim = "full", videoBlur = false }) {
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  // Reset the "failed" flag whenever the source changes (e.g. navigating
  // between two event pages without a full reload) so a PREVIOUS event's
  // video failure doesn't wrongly suppress a NEW event's video that may
  // load fine.
  useEffect(() => {
    setVideoFailed(false);
  }, [videoSrc]);

  const showVideo = !videoFailed && !reducedMotion && !!videoSrc;

  // Belt-and-suspenders: force `muted` on the DOM node directly and call
  // `.play()` explicitly too, in case the browser's initial parse still
  // needs a nudge (e.g. the source URL changes on an already-mounted
  // element when navigating between two event pages without a full
  // reload - `src` changing doesn't always restart playback on its own).
  useEffect(() => {
    if (!showVideo || !videoRef.current) return;
    const el = videoRef.current;
    el.muted = true;
    el.defaultMuted = true;
    const playPromise = el.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((err) => {
        // Genuinely blocked by the browser - not a load failure, so this
        // deliberately does NOT set videoFailed (that would fall back to
        // the plain image entirely). The poster frame already covers
        // this visually. Logged so a real block is visible in the
        // console instead of an invisible dead end.
        console.warn("EventHeroMedia: video play() was blocked", err);
      });
    }
  }, [showVideo, videoSrc]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-void">
      {/* ROOT-CAUSE FIX (this round, per direct DOM confirmation): the
       * <video> element itself was ALREADY correctly configured (src,
       * autoplay, muted, etc. all verified) - it was never broken. The
       * actual visible problem was this component ALSO rendering
       * `CinematicImage` (the stock/Picsum fallback <img> + its own two
       * wrapper divs - tint layer, scrim layer) as a SEPARATE layer
       * sitting directly BEHIND the video in the same stack, any time
       * `showVideo` is true. Two independent layers occupying the same
       * spot is what made it possible for the wrong one to be what's
       * actually visible/inspected, even though the video element
       * "underneath" (in DOM-order terms, actually on top - see the
       * video's own position below) was completely fine on its own.
       *
       * Fix: render `CinematicImage` ONLY when there is no video to
       * show at all (`!showVideo` - reduced motion, no video src for
       * this event, or the video genuinely 404s/errors) - i.e. its
       * original, actual job as a FALLBACK, not a simultaneous second
       * layer. When a video is showing, this component renders NOTHING
       * but the <video> itself plus the scrim overlay - no stock image,
       * no wrapper divs, at all. */}
      {!showVideo && <CinematicImage src={imageSrc} alt={alt} zoomOnHover={false} scrim={scrim} />}

      {showVideo && (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            ...(videoBlur ? { filter: "blur(3px) brightness(0.55)" } : {}),
            // BUG FIX (mobile responsiveness): Explicitly constrain video
            // to viewport bounds on all screen sizes. The existing Tailwind
            // classes (w-full h-full) should handle this, but some mobile
            // browsers don't respect percentage-based sizing on video
            // elements within absolute-positioned containers. Setting
            // explicit maxWidth/maxHeight ensures the video never exceeds
            // viewport dimensions, preventing horizontal scroll or
            // desktop-width rendering on mobile devices.
            maxWidth: "100vw",
            maxHeight: "100vh",
          }}
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
