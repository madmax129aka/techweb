import { api } from "./api";

/**
 * Global click/event logger.
 *
 * WHY THIS EXISTS: browser `console.log()` only ever prints to the
 * browser's own DevTools console (F12) - it runs in the browser tab's
 * process, which is completely separate from the Node process that
 * `npm run dev` starts for the backend. That's why clicking things on the
 * site never showed up in the VS Code terminal: there was previously no
 * bridge between "things happening in the browser" and "the terminal you
 * actually have open."
 *
 * This module listens for every click on the page (capture phase, so it
 * sees clicks before React's own handlers can stop propagation) and POSTs
 * a small description of it to POST /api/logs/client, which prints it in
 * the SAME terminal running the backend (see server/routes/logs.js).
 *
 * It intentionally:
 *  - never throws or blocks the UI if the request fails (logging must
 *    never break the app)
 *  - batches nothing / adds no queue - each click is a fire-and-forget
 *    fetch, which is fine for a dev/demo logging feature
 *  - also logs unhandled JS errors and rejected promises, so runtime
 *    crashes show up in the terminal too, not just clicks
 */

function describeTarget(el) {
  if (!el || el === document || el === document.body) return "document";

  const tag = el.tagName ? el.tagName.toLowerCase() : "node";
  const text = (el.innerText || el.textContent || "").trim().slice(0, 40);
  const id = el.id ? `#${el.id}` : "";
  const testId = el.dataset?.log ? `[data-log="${el.dataset.log}"]` : "";
  const role = el.getAttribute?.("role") ? `[role=${el.getAttribute("role")}]` : "";

  return `<${tag}${id}${testId}${role}>${text ? ` "${text}"` : ""}`;
}

function send(type, payload) {
  api
    .post("/api/logs/client", {
      type,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      ...payload,
    })
    .catch(() => {
      // Never let logging failures affect the app - if the backend is
      // down or unreachable, we just silently skip this log line.
    });
}

export function initClickLogger() {
  document.addEventListener(
    "click",
    (e) => {
      // Walk up from the exact click point to the nearest interactive
      // element (button/link/etc.) so the log line is meaningful even
      // when the user clicks an icon or span inside a button.
      const interactive = e.target.closest?.(
        "button, a, [role='button'], input, select, textarea, [data-log]"
      );
      const el = interactive || e.target;

      send("click", { target: describeTarget(el) });
    },
    { capture: true }
  );

  window.addEventListener("error", (e) => {
    send("js-error", { target: e.message, meta: { file: e.filename, line: e.lineno } });
  });

  window.addEventListener("unhandledrejection", (e) => {
    send("unhandled-rejection", { target: String(e.reason) });
  });

  send("session-start", { target: "app mounted" });
}
