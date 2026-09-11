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

      <div className="p-5 flex gap-4" style={{ backgroundColor: "#0B0A08" }}>
        <div
          className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border-2 border-gold/50"
          style={{ backgroundColor: "#181611" }}
        >
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold text-white truncate">{user?.name}</p>
          <p className="text-xs text-white/60 truncate">{user?.collegeName || "—"}</p>
          <p className="text-xs text-white/60">Reg No: {user?.registerNo || "N/A"}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: "#F2D48A" }}>
            {registration?.registrationCode}
          </p>
        </div>
      </div>

      {registration?.teamName && (
        <div className="px-5 pb-2" style={{ backgroundColor: "#0B0A08" }}>
          <p className="text-xs font-semibold" style={{ color: "#F2C230" }}>
            Team: {registration.teamName}
          </p>
          {Array.isArray(registration.teamMembers) && (
            <ul className="text-xs text-white/70 mt-1 space-y-0.5">
              {registration.teamMembers.map((m, i) => (
                <li key={i}>
                  {m.name} ({m.regNo}) {m.role === "lead" ? "— Lead" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="px-5 pb-3" style={{ backgroundColor: "#0B0A08" }}>
        <p className="text-xs text-white/60 mb-1">Registered Events</p>
        <ul className="text-sm text-white space-y-0.5">
          {(events || []).map((e) => (
            <li key={e.id} className="truncate">• {e.name}</li>
          ))}
        </ul>
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
