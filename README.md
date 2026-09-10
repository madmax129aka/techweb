# TechAstra — National Symposium Portal

A multi-role event management platform for a national-level college
symposium: registration, UPI payment verification, digital ID cards with QR
codes, event check-in, food distribution tracking, live results, and digital
certificates.

## Tech Stack

- **Frontend:** React (Vite) + TailwindCSS + shadcn/ui-style components, React Router
- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT + bcrypt, role-gated routes
- **QR codes:** `qrcode` (generation), `html5-qrcode` (camera scanning)
- **PDFs:** `pdf-lib` (certificates, server-side), `jspdf` + `html2canvas` (ID card, client-side)
- **Real-time:** Socket.io (announcements, live leaderboard), falls back to polling
- **Uploads:** Multer (payment screenshots) stored under `server/uploads/`
- **Charts:** Recharts
- **Email:** Nodemailer (Gmail SMTP) — logs to console instead of sending if unconfigured

## Repository Layout

```
techweb/
├── server/                 Express API + Prisma schema
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── routes/              one file per resource (auth, events, registrations, ...)
│   ├── middleware/          auth.js (JWT + role guard), upload.js (Multer)
│   ├── utils/                qr.js, codes.js, mailer.js, csv.js, certificatePdf.js
│   ├── index.js
│   └── .env.example
├── client/                  React + Vite frontend
│   ├── src/
│   │   ├── pages/            public pages + role portals
│   │   ├── components/       shared UI (Button, Card, Badge, Modal, QRScanner, ...)
│   │   ├── context/          AuthContext, CartContext
│   │   └── lib/              api.js (fetch wrapper), socket.js
│   └── .env.example
├── SEED_CREDENTIALS.md      full list of seeded logins (all demo/staff accounts)
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (Replit's built-in Postgres/Neon integration works well)

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env: set DATABASE_URL, JWT_SECRET, UPI_PAYEE_ID, UPI_PAYEE_NAME, etc.

npx prisma migrate dev --name init   # creates tables
npm run seed                         # populates demo events, colleges, staff logins,
                                      # sample registrations/results/certificates
npm run dev                          # starts the API on http://localhost:4000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
# edit .env: set VITE_API_URL (default http://localhost:4000)

npm run dev                          # starts Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

## Environment Variables

See `server/.env.example` and `client/.env.example` for the full list. Key ones:

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | server | Postgres connection string |
| `JWT_SECRET` | server | Signs auth tokens — use a long random string |
| `UPI_PAYEE_ID` / `UPI_PAYEE_NAME` | server | Used to build the UPI deep-link QR on Checkout |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | server | Optional — leave blank to log emails to console instead of sending |
| `CLIENT_ORIGIN` | server | CORS + Socket.io allowed origin (your frontend URL) |
| `VITE_API_URL` | client | Base URL the frontend calls for the API |

## Seeded Logins

Every role (master admin, registration team, coordinators, hospitality,
certificate team, volunteers) has a demo login. **Full list, including
sample participant accounts, is in [`SEED_CREDENTIALS.md`](./SEED_CREDENTIALS.md).**

All seeded accounts share the password `TechAstra@2026` — change this before
any real deployment.

## Demo Events

The seed script currently populates **8 placeholder events** (Coding
Marathon, Paper Presentation, Hackathon, Tech Quiz, Robo Race, Web Design
Contest, Poster Presentation, Startup Pitch) with sample times, fees, and
seat counts. These are **placeholders** — once the real symposium event
list is finalized, update `server/prisma/seed.js` (`buildDemoEvents()`) or
add/edit events directly via the Master Admin Portal's Event Management
tab, then re-seed or use the admin UI.

## End-to-End Flow (manual test checklist)

1. Visit `/events`, add 1-2 non-clashing events to the cart.
2. Fill out `/register` (individual or team), proceed to `/checkout`.
3. Scan/note the UPI QR, enter a transaction ID, submit → registration is `pending`.
4. Log in as a Registration Team account, approve the registration.
5. Log in as the participant → view the digital ID card on `/dashboard`, download as PDF.
6. Log in as the event's Coordinator → scan the participant's QR to check them in.
7. Coordinator selects 1st/2nd/3rd place winners → results lock immediately.
8. Confirm the result appears on the public `/leaderboard` in real time.
9. Log in as Certificate Team → generate a certificate for the participant.
10. Visit `/verify-certificate`, enter the certificate code → confirm it validates.

## Known Limitations / Next Steps

- File uploads (payment screenshots, ID photos) are stored on local disk
  under `server/uploads/` — fine for a prototype/single-instance deployment,
  but won't persist across ephemeral container restarts on some hosts.
- Offline-tolerant QR scanning (queueing scans while offline) is not yet
  implemented — the scanner components currently require connectivity.
- Bulk CSV registration upload, coupon codes, and the big-screen leaderboard
  display mode are listed as nice-to-haves and are not yet built.
- Email sending requires real SMTP credentials in `.env`; without them the
  server logs the email content to the console instead (safe default for
  local development).
