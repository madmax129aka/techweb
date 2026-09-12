import React from "react";

/**
 * The six pillars behind the "VISION" theme name, presented as a quiet,
 * borderless list rather than a grid of boxed cards - per the cinematic
 * layout brief ("no bright card backgrounds, no borders or drop shadows,
 * let the graphic/typography do the talking"). Each row is separated by
 * a thin hairline rather than a card boundary.
 */
const PILLARS = [
  {
    letter: "V",
    title: "Virtual Intelligence",
    desc: "AI-driven systems, neural networks, and intelligent agents shaping how machines reason and learn.",
    accent: "text-crimson-light",
  },
  {
    letter: "I",
    title: "Information Security",
    desc: "Cryptography, threat defense, and resilient architectures that keep data safe in an adversarial world.",
    accent: "text-arc",
  },
  {
    letter: "S",
    title: "Sustainable Innovation",
    desc: "Green tech, renewable systems, and engineering that balances progress with planetary responsibility.",
    accent: "text-crimson-light",
  },
  {
    letter: "I",
    title: "Intelligent Healthcare",
    desc: "Diagnostics, biomedical devices, and predictive care systems powered by data and machine learning.",
    accent: "text-arc",
  },
  {
    letter: "O",
    title: "Optimization & Automation",
    desc: "Robotics, process automation, and algorithms that squeeze maximum efficiency out of every system.",
    accent: "text-crimson-light",
  },
  {
    letter: "N",
    title: "Next-generation Networks",
    desc: "5G/6G, IoT mesh systems, and the connective infrastructure powering a hyper-connected future.",
    accent: "text-arc",
  },
];

export default function VisionPillars() {
  return (
    <section className="py-24 sm:py-32 border-t border-crimson/10">
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">The Theme</p>
        <h2 className="font-serif text-3xl sm:text-5xl text-offwhite">
          Vis<span className="italic text-crimson-light">i</span>on
        </h2>
      </div>

      <div className="max-w-3xl mx-auto px-6 divide-y divide-crimson/10">
        {PILLARS.map((p, i) => (
          <div
            key={`${p.letter}-${i}`}
            className="flex items-start gap-6 sm:gap-10 py-8 group cursor-hover"
          >
            <span className={`font-serif italic text-4xl sm:text-5xl shrink-0 w-10 ${p.accent}`}>
              {p.letter}
            </span>
            <div className="text-left">
              <h3 className="font-heading text-base sm:text-lg text-offwhite mb-1.5 tracking-wide">
                {p.title}
              </h3>
              <p className="text-offwhite/50 text-sm leading-relaxed max-w-xl">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
