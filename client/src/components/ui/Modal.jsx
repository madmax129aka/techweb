import React from "react";

export default function Modal({ open, onClose, title, children, fullScreen = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className={`glass-gold rounded-2xl w-full shadow-gold ${fullScreen ? "max-w-3xl h-[85vh]" : "max-w-lg"} flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/20">
          <h3 className="font-heading text-lg font-semibold text-gold-light">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white/60 hover:text-white text-xl leading-none px-2"
          >
            &times;
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
