import React from "react";

const STYLES = {
  pending: "bg-warning/15 text-warning border border-warning/40",
  approved: "bg-success/15 text-success border border-success/40",
  present: "bg-success/15 text-success border border-success/40",
  rejected: "bg-danger/15 text-danger border border-danger/40",
  absent: "bg-danger/15 text-danger border border-danger/40",
  collected: "bg-success/15 text-success border border-success/40",
  "not-collected": "bg-white/10 text-white/70 border border-white/20",
  info: "bg-cyan/15 text-cyan border border-cyan/40",
  neutral: "bg-white/10 text-white/70 border border-white/20",
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
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status] || STYLES.neutral} ${className}`}
    >
      {children || LABELS[status] || status}
    </span>
  );
}
