import React, { useState } from "react";

/**
 * Single FAQ page, categorized questions in a plain expandable accordion,
 * one item open at a time - per the brief: "plain typography, no icons/
 * illustrations needed." Uses a CSS grid-rows trick (see index.css
 * .accordion-panel) to animate open/closed without measuring content
 * height in JS.
 */
const CATEGORIES = [
  {
    category: "Registration Issues",
    items: [
      {
        q: "I haven't received my registration code. What do I do?",
        a: "Check your email's spam/promotions folder first. If it's genuinely missing, use the Status page (in the menu, under My Dashboard) and search by the email address you registered with - it will show your registration code and current status.",
      },
      {
        q: "Can I change my team members after registering?",
        a: "Contact the Registration Team via the Help Desk with your registration code and the change you need. Team changes must be made before your registration is approved.",
      },
      {
        q: "I registered for two events that overlap in time. What happens?",
        a: "The cart blocks you from adding two events with overlapping timings in the first place, so this shouldn't be possible through normal registration. If you believe you're seeing a clash incorrectly, contact the Help Desk.",
      },
    ],
  },
  {
    category: "Payment Issues",
    items: [
      {
        q: "I paid but my registration still shows 'Pending'.",
        a: "Payments are verified manually by the Registration Team, so there's normally a short delay between paying and approval. If it's been more than 24 hours, contact the Help Desk with your registration code and UPI transaction ID.",
      },
      {
        q: "My registration was rejected. Can I get a refund?",
        a: "Rejections are usually due to an unmatched or invalid transaction ID. Contact the Help Desk with proof of payment (screenshot + transaction ID) and the team will review it - approved refunds are processed by the Master Admin.",
      },
      {
        q: "What if I paid the wrong amount?",
        a: "Contact the Help Desk immediately with your transaction ID and the correct amount for your selected events. Do not attempt to pay again until the team confirms next steps.",
      },
    ],
  },
  {
    category: "Event-Day Queries",
    items: [
      {
        q: "What should I bring on the day of the event?",
        a: "Your digital ID card (accessible from My Dashboard once approved) with its QR code - this is scanned for check-in at your event and at food counters. A physical or digital copy both work.",
      },
      {
        q: "I lost access to my account / can't find my QR code.",
        a: "Visit the Registration Team desk on the day with your name and college - they can look up your registration and re-display your QR code for you.",
      },
      {
        q: "How and when are results announced?",
        a: "Results are announced live as each event concludes, and appear immediately on the public Leaderboard page. Winners are also announced at the venue by the event coordinator.",
      },
    ],
  },
];

export default function FAQ() {
  // Tracks a single open item as "categoryIndex-itemIndex", or null.
  const [openKey, setOpenKey] = useState(null);

  const toggle = (key) => setOpenKey((prev) => (prev === key ? null : key));

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4 text-center">Support</p>
      <h1 className="font-serif text-3xl sm:text-5xl text-offwhite text-center mb-16">
        Frequently Asked Questions
      </h1>

      {CATEGORIES.map((cat, catIdx) => (
        <div key={cat.category} className="mb-14">
          <h2 className="font-heading text-sm uppercase tracking-wide text-crimson-light mb-2">
            {cat.category}
          </h2>

          <div>
            {cat.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`;
              const isOpen = openKey === key;
              return (
                <div key={key} className="accordion-item">
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left"
                    aria-expanded={isOpen}
                    data-log={`faq-toggle-${key}`}
                  >
                    <span className="text-offwhite text-base sm:text-lg">{item.q}</span>
                    <span className="text-offwhite/40 text-xl leading-none shrink-0">
                      {isOpen ? "\u2212" : "+"}
                    </span>
                  </button>
                  <div className={`accordion-panel ${isOpen ? "accordion-open" : ""}`}>
                    <div>
                      <p className="text-offwhite/55 text-sm leading-relaxed pb-5 max-w-2xl">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
