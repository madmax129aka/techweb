import React, { useEffect } from "react";

/**
 * Slide-in-from-right form overlay, over a dimmed backdrop, with a "Back"
 * link to dismiss - per the "forms as overlays, not separate pages"
 * pattern (Rolls-Royce's Enquiry/Brochure/Callback panels never navigate
 * away from the page you were on). Used for Registration, Checkout,
 * Feedback, and Help Desk instead of routing to a dedicated page.
 *
 * Distinct from ui/Modal.jsx (which is a small centered dialog, used for
 * things like rulebooks and confirmation prompts) - SlidePanel is wider,
 * anchored to the right edge, and always shows a labeled "Back" control
 * rather than a bare close icon, matching the reference site's language.
 */
export default function SlidePanel({ open, onClose, title, eyebrow, children, backLabel = "Back" }) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="absolute inset-0 bg-void/80 backdrop-blur-sm animate-panel-backdrop"
        onClick={onClose}
        data-log="slide-panel-backdrop-dismiss"
      />

      <div className="relative w-full sm:w-[520px] h-full bg-void border-l border-crimson/20 overflow-y-auto animate-panel-slide-in">
        <div className="px-6 sm:px-10 py-8">
          <button
            onClick={onClose}
            className="link-cta mb-10"
            data-log="slide-panel-back"
          >
            <span aria-hidden="true" className="rotate-180 inline-block">&rarr;</span>
            {backLabel}
          </button>

          {eyebrow && (
            <p className="text-arc text-[11px] tracking-cinematic uppercase mb-3">{eyebrow}</p>
          )}
          {title && <h2 className="font-serif text-2xl sm:text-3xl text-offwhite mb-8">{title}</h2>}

          {children}
        </div>
      </div>
    </div>
  );
}
