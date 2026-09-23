# Login Page — Implementation Tasks

- [ ] 1. Restore the 3D Core in the left panel
  - In `Login.jsx`, re-import `TechAstraCore` and render it inside
    `<div className="core-canvas-frame"><TechAstraCore size={480} /></div>`.
  - Remove the `<video>` element, `showVideo`/`videoFailed` state, and the
    video `onError` handler.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 2. Remove the video CSS and restore the page background
  - Delete `.login-video-bg` and `.login-video-scrim` from `Login.css`.
  - Restore a solid charcoal base / `::before` wash on `.login-page` behind
    the transparent Canvas, and revert the video-specific z-index layering.
  - _Requirements: 5.1, 5.3_

- [ ] 3. Keep the glassmorphism form, drop the role selector
  - Ensure the right panel keeps the glass-card treatment and cyan focus.
  - Remove any leftover role-selector JSX and `.role-*` CSS if present.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.3_

- [ ] 4. Preserve chrome: header, two-ring cursor, layout
  - Keep the sticky header (TechAstraLogo, nav, cart, LOGIN, hamburger →
    FullScreenMenu) and the two-ring trailing cursor (fine-pointer,
    reduced-motion-gated).
  - Confirm 2-col ≥900px / stacked below, scrollable on mobile.
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Preserve auth behavior
  - Keep `useAuth().login`, toast on error, loading/disabled submit, the
    server-authoritative `PORTAL_PATH[user.role]` redirect, and the
    `/status` link.
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Delete the unused video asset
  - Remove `client/public/videos/login-core.mp4` (no longer referenced).
  - _Requirements: 5.2_

- [ ] 7. Build verification
  - Run `npm run build` in `client/`; fix any errors.
  - Note: WebGL rendering can't be previewed in this environment; the Core's
    visual result requires a manual in-browser check.
  - _Requirements: all_
```