\# TechAstra Design System \& Steering Rules



\## Core Animation Standard

\- \*\*Framer Motion Required:\*\* Use `framer-motion` for all entrance reveals, page transitions, and interactive hover states.

\- \*\*Scroll Reveals:\*\* Apply staggered viewport entrance animations (`whileInView`, `viewport={{ once: true }}`).

\- \*\*Spring Physics:\*\* Use spring-based transitions for interactive triggers (`type: "spring", stiffness: 300, damping: 20`).



\## Layout \& Design Principles

\- \*\*Grid System:\*\* 8px base grid (`p-2`, `p-4`, `p-6`, `p-8`, `p-12`, `p-16`).

\- \*\*Typography Scale:\*\* Tight tracking on primary headings (`tracking-tight`), generous line height on body text (`leading-relaxed`).

\- \*\*Color Token Rules:\*\*

&#x20; - Backgrounds: Deep charcoal `#090A0F`, rich black, or dark crimson tints.

&#x20; - Accent Colors: Saturated cyan (`#00F0FF`) for highlights/badges, warm crimson/red for primary actions.

&#x20; - Cards \& Panels: Semi-transparent backdrops (`bg-slate-900/60 backdrop-blur-md border border-white/10`).

\- \*\*Anti-Patterns:\*\* Avoid default white-background card grids, flat un-animated buttons, and generic centered heroes.

