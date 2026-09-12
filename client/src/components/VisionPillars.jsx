import React from "react";
import TiltCard from "./TiltCard";

/**
 * The six pillars behind the "VISION" theme name, each rendered as a
 * pointer-tilting 3D card with its own signature color (see the `vision`
 * palette in tailwind.config.js).
 */
const PILLARS = [
  {
    letter: "V",
    title: "Virtual Intelligence",
    desc: "AI-driven systems, neural networks, and intelligent agents shaping how machines reason and learn.",
    color: "#8B5CF6",
    glow: "shadow-vision-v",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    letter: "I",
    title: "Information Security",
    desc: "Cryptography, threat defense, and resilient architectures that keep data safe in an adversarial world.",
    color: "#3DD9EB",
    glow: "shadow-vision-i1",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" strokeLinejoin="round" />
        <path d="M9.5 12l1.8 1.8L14.5 10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    letter: "S",
    title: "Sustainable Innovation",
    desc: "Green tech, renewable systems, and engineering that balances progress with planetary responsibility.",
    color: "#34D399",
    glow: "shadow-vision-s",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2C7 6 5 10 5 13.5A7 7 0 0 0 19 13.5C19 10 17 6 12 2z" strokeLinejoin="round" />
        <path d="M12 22v-8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    letter: "I",
    title: "Intelligent Healthcare",
    desc: "Diagnostics, biomedical devices, and predictive care systems powered by data and machine learning.",
    color: "#F472B6",
    glow: "shadow-vision-i2",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20.8 8.6c0 4-4.4 7.3-8.8 10.9C7.6 15.9 3.2 12.6 3.2 8.6a5 5 0 0 1 8.8-3.2 5 5 0 0 1 8.8 3.2z" strokeLinejoin="round" />
        <path d="M7 12h2.5l1.5-3 2 6 1.5-3H17" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    letter: "O",
    title: "Optimization & Automation",
    desc: "Robotics, process automation, and algorithms that squeeze maximum efficiency out of every system.",
    color: "#F2C230",
    glow: "shadow-vision-o",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19.4 13a7.4 7.4 0 0 0 0-2l2-1.2-1.5-2.6-2.3.6a7.4 7.4 0 0 0-1.7-1l-.3-2.3H9.4l-.3 2.3a7.4 7.4 0 0 0-1.7 1l-2.3-.6-1.5 2.6L5.6 13a7.4 7.4 0 0 0 0 2l-2 1.2 1.5 2.6 2.3-.6c.5.4 1.1.7 1.7 1l.3 2.3h5.2l.3-2.3c.6-.3 1.2-.6 1.7-1l2.3.6 1.5-2.6-2-1.2z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    letter: "N",
    title: "Next-generation Networks",
    desc: "5G/6G, IoT mesh systems, and the connective infrastructure powering a hyper-connected future.",
    color: "#3B82F6",
    glow: "shadow-vision-n",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="5" cy="12" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="19" cy="18" r="2" />
        <path d="M7 11l10-4M7 13l10 4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function VisionPillars() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <p className="text-gold-light font-display text-xs sm:text-sm font-bold uppercase tracking-[0.25em] mb-3">
          The Theme
        </p>
        <h2 className="font-serif italic text-3xl sm:text-5xl font-bold text-white mb-4">
          VIS<span className="text-gold-light">I</span>ON
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base">
          Six pillars of tomorrow's technology, each explored across a dedicated track of events.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1200px]">
        {PILLARS.map((p, i) => (
          <TiltCard
            key={`${p.letter}-${i}`}
            glowClass={`hover:${p.glow}`}
            className="p-6 animate-fade-in-up"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}55` }}
            >
              {p.icon}
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif italic text-3xl font-bold" style={{ color: p.color }}>
                {p.letter}
              </span>
              <h3 className="font-heading font-bold text-lg text-white">{p.title}</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{p.desc}</p>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
