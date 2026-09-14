import React, { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

/**
 * Official event badge styling in the TechAstra gold-on-black theme, with
 * the logo at the top. Rendered at a fixed pixel size (rather than
 * responsive %/max-w classes) so the html2canvas snapshot used for the
 * PDF/PNG download is pixel-predictable and doesn't reflow between what's
 * shown on screen and what gets captured.
 *
 * Uses QRCodeCanvas (renders to a real <canvas>) instead of QRCodeSVG -
 * html2canvas does not reliably rasterize inline <svg> elements, which
 * was causing the QR code to come out blank/misplaced in exports.
 */
const CARD_WIDTH = 380;

const IdCard = forwardRef(function IdCard({ registration, user, events }, ref) {
  return (
    <div
      ref={ref}
      style={{ width: CARD_WIDTH, backgroundColor: "#07070A" }}
      className="mx-auto rounded-2xl overflow-hidden border-2 border-gold/60"
    >
      {/* Header: logo + official id label, solid gold gradient (no blur/backdrop-filter) */}
      <div
        style={{
          background: "linear-gradient(135deg, #F7E3AC 0%, #D9A840 50%, #8A6A24 100%)",
        }}
        className="px-5 py-4 flex flex-col items-center gap-1"
      >
        <img src="/logo.png" alt="TechAstra '26" style={{ height: 40, objectFit: "contain" }} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-onyx">Official Delegate ID</span>
      </div>

      {/*
        NOTE: no Tailwind `truncate` (overflow:hidden + text-overflow:ellipsis
        + white-space:nowrap) anywhere below - html2canvas does not compute
        box height correctly for ellipsis-truncated lines, which collapsed
        each line's height to ~0 and made every following line render on
        top of the previous one. Fixed-width columns + normal wrapping
        instead, so long text wraps to a second line rather than relying
        on ellipsis truncation.
      */}
      <div className="p-5" style={{ backgroundColor: "#0B0A08", display: "flex", gap: 16 }}>
        <div
          className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center border-2 border-gold/50"
          style={{ backgroundColor: "#181611", flexShrink: 0 }}
        >
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>
        <div style={{ width: 244 }}>
          <p
            className="font-heading font-bold text-white"
            style={{ fontSize: 17, lineHeight: "22px", margin: 0, wordBreak: "break-word" }}
          >
            {user?.name}
          </p>
          <p
            className="text-white/60"
            style={{ fontSize: 12, lineHeight: "16px", margin: "3px 0 0", wordBreak: "break-word" }}
          >
            {user?.collegeName || "—"}
          </p>
          <p className="text-white/60" style={{ fontSize: 12, lineHeight: "16px", margin: "3px 0 0" }}>
            Reg No: {user?.registerNo || "N/A"}
          </p>
          <p style={{ fontSize: 12, lineHeight: "16px", margin: "4px 0 0", fontWeight: 600, color: "#F2D48A" }}>
            {registration?.registrationCode}
          </p>
        </div>
      </div>

      {registration?.teamName && (
        <div className="px-5 pb-2" style={{ backgroundColor: "#0B0A08" }}>
          <p style={{ fontSize: 12, lineHeight: "16px", margin: 0, fontWeight: 600, color: "#F2C230" }}>
            Team: {registration.teamName}
          </p>
          {Array.isArray(registration.teamMembers) && (
            <div style={{ marginTop: 4 }}>
              {registration.teamMembers.map((m, i) => (
                <p
                  key={i}
                  className="text-white/70"
                  style={{ fontSize: 11, lineHeight: "15px", margin: "2px 0 0", wordBreak: "break-word" }}
                >
                  {m.name} ({m.regNo}) {m.role === "lead" ? "— Lead" : ""}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-5 pb-3" style={{ backgroundColor: "#0B0A08" }}>
        <p className="text-white/60" style={{ fontSize: 12, lineHeight: "16px", margin: "0 0 4px" }}>
          Registered Events
        </p>
        <div>
          {(events || []).map((e) => (
            <p
              key={e.id}
              className="text-white"
              style={{ fontSize: 13, lineHeight: "18px", margin: "2px 0 0", wordBreak: "break-word" }}
            >
              • {e.name}
            </p>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-4">
        <QRCodeCanvas value={registration?.registrationCode || ""} size={140} />
      </div>
      <p
        className="text-center text-[10px] py-2"
        style={{ backgroundColor: "#0B0A08", color: "rgba(217,168,64,0.6)" }}
      >
        Present this QR at check-in and food counters
      </p>
    </div>
  );
});

export default IdCard;
