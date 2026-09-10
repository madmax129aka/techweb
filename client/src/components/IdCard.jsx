import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * Styled like a real event badge - photo, name, college, register number,
 * registered events, team roster (if applicable), and a QR code encoding
 * the registrationCode. Forwarded ref is used by the Dashboard page to
 * rasterize this into a PDF/PNG via html2canvas.
 */
const IdCard = forwardRef(function IdCard({ registration, user, events }, ref) {
  return (
    <div
      ref={ref}
      className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-cyan/30 bg-gradient-to-br from-[#161B2E] to-[#0F1424] shadow-glow"
    >
      <div className="bg-cyan text-base px-5 py-3 flex items-center justify-between">
        <span className="font-heading font-bold text-lg">TechAstra 2026</span>
        <span className="text-xs font-semibold">OFFICIAL ID</span>
      </div>

      <div className="p-5 flex gap-4">
        <div className="w-20 h-20 rounded-xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold text-white truncate">{user?.name}</p>
          <p className="text-xs text-white/60 truncate">{user?.collegeName || "—"}</p>
          <p className="text-xs text-white/60">Reg No: {user?.registerNo || "N/A"}</p>
          <p className="text-xs text-cyan mt-1">{registration?.registrationCode}</p>
        </div>
      </div>

      {registration?.teamName && (
        <div className="px-5 pb-2">
          <p className="text-xs text-violet font-semibold">Team: {registration.teamName}</p>
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

      <div className="px-5 pb-3">
        <p className="text-xs text-white/60 mb-1">Registered Events</p>
        <ul className="text-sm text-white space-y-0.5">
          {(events || []).map((e) => (
            <li key={e.id} className="truncate">• {e.name}</li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center bg-white p-4">
        <QRCodeSVG value={registration?.registrationCode || ""} size={140} />
      </div>
      <p className="text-center text-[10px] text-white/40 py-2">
        Present this QR at check-in and food counters
      </p>
    </div>
  );
});

export default IdCard;
