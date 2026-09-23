import React from "react";

// success/warning/danger stay as universally-understood status colors
// (green/amber/red) per the brief's "clear status badges" requirement for
// dense portal tables - only the theme-neutral "info"/"neutral" variants
// were recolored from cyan/white to the site's actual accent (arc) and
// off-white, so a default Badge no longer looks like a leftover from the
// old palette.
const STYLES = {
  pending: "bg-warning/15 text-warning border border-warning/40",
  approved: "bg-success/15 text-success border border-success/40",
  present: "bg-success/15 text-success border border-success/40",
  rejected: "bg-danger/15 text-danger border border-danger/40",
  absent: "bg-danger/15 text-danger border border-danger/40",
  collected: "bg-success/15 text-success border border-success/40",
  "not-collected": "bg-offwhite/10 text-offwhite/70 border border-offwhite/20",
  info: "bg-arc/15 text-arc border border-arc/40",
  neutral: "bg-offwhite/10 text-offwhite/70 border border-offwhite/20",
};

const LABELS = {
  pending: "Pending",
  approved: "Approved",
  present: "Present",
  rejected: "Rejected",
  absent: "Absent",
  collected: "Collected",
  "not-collected": "Not Collected",
};

export default function Badge({ status = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium uppercase tracking-wider ${STYLES[status] || STYLES.neutral} ${className}`}
    >
      {children || LABELS[status] || status}
    </span>
  );
}
