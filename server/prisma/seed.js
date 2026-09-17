/**
 * Seed script for TechAstra Symposium Portal.
 *
 * Populates:
 *  - 15 FINAL events across two tracks - 8 Technical + 7 Non-Technical,
 *    per the finalized official event list (this is NOT placeholder
 *    data anymore; the earlier 8-event "Coding Marathon / Hackathon /
 *    Tech Quiz / ..." set was the placeholder, replaced wholesale here)
 *  - 4 sample colleges (used indirectly via registration collegeName)
 *  - one login per staff role (+ one coordinator per event)
 *  - ~14 dummy registrations spread across pending/approved/rejected
 *  - a few locked results + generated certificates for demo purposes
 *
 * Run with: npm run seed  (inside /server, after `npx prisma migrate dev`)
 * Safe to re-run against a fresh database; it does NOT clear existing data
 * automatically - see the note at the bottom of this file if you need a
 * clean slate.
 */

const bcrypt = require("bcrypt");
const prisma = require("../db");
const { generateCertificatePdf } = require("../utils/certificatePdf");

const DEMO_PASSWORD = "TechAstra@2026";

const COLLEGES = [
  "Sri Venkateswara College of Engineering",
  "St. Joseph's Institute of Technology",
  "Anna Institute of Technology",
  "PSG College of Technology",
];

// FINAL event list (8 Technical + 7 Non-Technical). Sample times, fees,
// seat counts, venues, and rulebook text below are still illustrative
// placeholders for THOSE specific details - swap in the real schedule/
// fee/venue numbers once finalized - but the event NAMES, tracks, and
// category split are final.
function buildDemoEvents() {
  const day = (h, m = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // symposium day, 2 weeks out
    d.setHours(h, m, 0, 0);
    return d;
  };

  return [
    // ---------------------------------------------------------------
    // TECHNICAL EVENTS (8)
    // ---------------------------------------------------------------
    {
      name: "Pen Your Vision",
      description: "Pitch your boldest technical idea or research concept as a written paper and a stand-up pitch to a panel of judges.",
      track: "Paper Presentation",
      category: "technical",
      startTime: day(9, 0),
      endTime: day(11, 0),
      fee: 100,
      maxSeats: 40,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Seminar Hall A",
      rulebook: "Individual event. Submit a 2-page abstract one day prior via the help desk email. 8 minutes pitch + 2 minutes Q&A on stage.",
    },
    {
      name: "Hack Nexus",
      description: "A high-intensity hackathon where teams build a working prototype for a surprise problem statement in a single day.",
      track: "Hackathon",
      category: "technical",
      startTime: day(9, 0),
      endTime: day(17, 0),
      fee: 300,
      maxSeats: 60,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      venue: "Main Auditorium",
      rulebook: "Teams of 2-4. Problem statements released at 9 AM sharp. Final demo at 4:30 PM. Any tech stack allowed.",
    },
    {
      name: "Crypt Clash",
      description: "Crack ciphers, puzzles, and cryptographic challenges head-to-head in a fast elimination format.",
      track: "Cybersecurity",
      category: "technical",
      startTime: day(10, 0),
      endTime: day(12, 0),
      fee: 120,
      maxSeats: 50,
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 2,
      venue: "Computer Lab 1",
      rulebook: "Teams of 1-2. Multiple rounds of increasing difficulty; fastest correct submissions advance to the next round.",
    },
    {
      name: "Trial of Truth",
      description: "A rapid-fire technical quiz that puts your knowledge on trial - answer fast and accurately to survive each round.",
      track: "Technical Quiz",
      category: "technical",
      startTime: day(10, 15),
      endTime: day(12, 0),
      fee: 50,
      maxSeats: 100,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 2,
      venue: "Seminar Hall B",
      rulebook: "Teams of 2. Written prelims followed by an on-stage final for the top 6 teams.",
    },
    {
      name: "Code Rescue",
      description: "Debug broken, misbehaving code under time pressure and rescue it before the clock runs out.",
      track: "Debugging",
      category: "technical",
      startTime: day(13, 0),
      endTime: day(15, 0),
      fee: 100,
      maxSeats: 60,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Computer Lab 2",
      rulebook: "Individual event. Bring your own laptop. Languages allowed: C, C++, Java, Python. Bugs are scored by difficulty.",
    },
    {
      name: "Pixel Protocol",
      description: "Design and build a pixel-perfect responsive webpage or interface from a surprise theme, live.",
      track: "Web/UI Design",
      category: "technical",
      startTime: day(13, 0),
      endTime: day(15, 0),
      fee: 120,
      maxSeats: 50,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Computer Lab 3",
      rulebook: "Individual event. Theme revealed at start. HTML/CSS/JS only, no frameworks.",
    },
    {
      name: "Forensic Alibi",
      description: "Analyze digital evidence, decode clues, and piece together the truth behind a simulated cybercrime scene.",
      track: "Digital Forensics",
      category: "technical",
      startTime: day(9, 30),
      endTime: day(11, 30),
      fee: 150,
      maxSeats: 40,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 3,
      venue: "Cyber Lab",
      rulebook: "Teams of 2-3. Analyze provided logs and files to identify the culprit; submit your case report before time runs out.",
    },
    {
      name: "Prompt Arena",
      description: "Craft the sharpest AI prompts to solve given challenges - precision and creativity decide the winner.",
      track: "Artificial Intelligence",
      category: "technical",
      startTime: day(15, 0),
      endTime: day(17, 0),
      fee: 100,
      maxSeats: 50,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Computer Lab 4",
      rulebook: "Individual event. Given a target output, write the best-performing prompt within the time and token limits provided.",
    },

    // ---------------------------------------------------------------
    // NON-TECHNICAL EVENTS (7)
    // ---------------------------------------------------------------
    {
      name: "Rythm Riot",
      description: "A high-energy dance battle where solo performers or crews bring their best moves to the stage.",
      track: "Dance",
      category: "non_technical",
      startTime: day(14, 0),
      endTime: day(16, 0),
      fee: 80,
      maxSeats: 60,
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 8,
      venue: "Open Air Theatre",
      rulebook: "Solo or group (up to 8). 3-5 minutes per performance. Own music track required (submit in advance).",
    },
    {
      name: "70MM Decode",
      description: "A movie-lovers' quiz spanning dialogues, scenes, and trivia across cinema - decode the clues before your rivals do.",
      track: "Cinema Quiz",
      category: "non_technical",
      startTime: day(11, 0),
      endTime: day(12, 30),
      fee: 50,
      maxSeats: 100,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      venue: "Seminar Hall C",
      rulebook: "Teams of 2-4. Rounds include dialogue identification, scene guessing, and rapid-fire cinema trivia.",
    },
    {
      name: "Verbal Combat",
      description: "A sharp-tongued debate showdown where words are your only weapon - argue, counter, and win the room.",
      track: "Debate",
      category: "non_technical",
      startTime: day(10, 0),
      endTime: day(12, 0),
      fee: 80,
      maxSeats: 40,
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 2,
      venue: "Debate Hall",
      rulebook: "Solo or pairs. Topics announced 10 minutes before each round. 3 minutes per speaker, judged on argument and delivery.",
    },
    {
      name: "Blitz Hunt",
      description: "A campus-wide clue-solving chase against the clock, in teams.",
      track: "Treasure Hunt",
      category: "non_technical",
      startTime: day(11, 0),
      endTime: day(13, 0),
      fee: 60,
      maxSeats: 90,
      isTeamEvent: true,
      minTeamSize: 3,
      maxTeamSize: 5,
      venue: "Campus Grounds",
      rulebook: "Teams of 3-5. Clues are physical and digital. First team to the final location wins; no vehicles allowed.",
    },
    {
      name: "Plot Twist",
      description: "Build a story live with your team - then survive the surprise twist announced mid-event.",
      track: "Storytelling",
      category: "non_technical",
      startTime: day(13, 30),
      endTime: day(15, 30),
      fee: 90,
      maxSeats: 50,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 5,
      venue: "Drama Studio",
      rulebook: "Teams of 2-5. A base scenario is given; a plot twist is revealed halfway through and must be woven into the finale.",
    },
    {
      name: "Team Fued",
      description: "A head-to-head team quiz show, game-show style - buzz in first, answer sharp, out-survey the other team.",
      track: "Team Quiz",
      category: "non_technical",
      startTime: day(13, 0),
      endTime: day(14, 30),
      fee: 70,
      maxSeats: 60,
      isTeamEvent: true,
      minTeamSize: 4,
      maxTeamSize: 6,
      venue: "Seminar Hall D",
      rulebook: "Teams of 4-6. Survey-style questions; fastest correct buzz-in scores for the team. Bracket-style knockout rounds.",
    },
    {
      name: "Cap Chaos",
      description: "Caption the chaos - submit the funniest, sharpest caption for each surprise image within the time limit.",
      track: "Meme/Caption Contest",
      category: "non_technical",
      startTime: day(9, 0),
      endTime: day(15, 0),
      fee: 40,
      maxSeats: 100,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Media Lab",
      rulebook: "Individual event. New image revealed every round; submit your caption within 60 seconds. Audience + judges vote.",
    },
  ];
}

async function upsertStaff({ name, email, role, assignedEventId, dutyDesk, dutyTiming, dutyRole }) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      passwordHash,
      role,
      assignedEventId: assignedEventId || null,
      dutyDesk: dutyDesk || null,
      dutyTiming: dutyTiming || null,
      dutyRole: dutyRole || null,
    },
  });
}

async function createParticipantWithRegistration({
  name, email, college, registerNo, eventIds, teamName, teamMembers, status, rejectionReason, txnPrefix, index,
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const events = await prisma.event.findMany({ where: { id: { in: eventIds } } });
  const totalAmount = events.reduce((sum, e) => sum + e.fee, 0);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "participant",
      collegeName: college,
      registerNo,
    },
  });

  const registrationCode = `SYM${new Date().getFullYear()}-${String(index).padStart(4, "0")}`;

  const registration = await prisma.registration.create({
    data: {
      registrationCode,
      userId: user.id,
      eventIds,
      teamName: teamName || null,
      teamMembers: teamMembers || undefined,
      collegeName: college,
      totalAmount,
      transactionId: `${txnPrefix}${index}`,
      status,
      rejectionReason: rejectionReason || null,
    },
  });

  if (status === "approved") {
    await Promise.all(
      eventIds.map((id) => prisma.event.update({ where: { id }, data: { seatsTaken: { increment: 1 } } }))
    );
  }

  return { user, registration };
}

async function main() {
  console.log("Seeding TechAstra database...\n");

  // 1. Events
  const eventData = buildDemoEvents();
  const events = [];
  for (const data of eventData) {
    const event = await prisma.event.create({ data });
    events.push(event);
    console.log(`Created event: ${event.name}`);
  }
  const [
    penVision, hackNexus, cryptClash, trialOfTruth, codeRescue, pixelProtocol, forensicAlibi, promptArena,
    rythmRiot, decode70mm, verbalCombat, blitzHunt, plotTwist, teamFued, capChaos,
  ] = events;

  // 2. Staff accounts
  const masterAdmin = await upsertStaff({ name: "Dr. HOD Admin", email: "admin@techastra.dev", role: "master_admin" });
  const regTeam1 = await upsertStaff({ name: "Reg Desk Alpha", email: "regteam1@techastra.dev", role: "registration_team" });
  const regTeam2 = await upsertStaff({ name: "Reg Desk Beta", email: "regteam2@techastra.dev", role: "registration_team" });
  const hospitality = await upsertStaff({ name: "Hospitality Lead", email: "hospitality@techastra.dev", role: "hospitality" });
  const certTeam = await upsertStaff({ name: "Certificate Desk", email: "certificates@techastra.dev", role: "certificate_team" });
  const volunteer1 = await upsertStaff({
    name: "Volunteer One", email: "volunteer1@techastra.dev", role: "volunteer",
    dutyDesk: "Main Entrance", dutyTiming: "8:00 AM - 1:00 PM", dutyRole: "Registration Desk Support",
  });
  const volunteer2 = await upsertStaff({
    name: "Volunteer Two", email: "volunteer2@techastra.dev", role: "volunteer",
    dutyDesk: "Food Court", dutyTiming: "12:00 PM - 4:00 PM", dutyRole: "Hospitality Support",
  });

  // One coordinator per event
  const coordinators = [];
  for (const event of events) {
    const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const coordinator = await upsertStaff({
      name: `${event.name} Coordinator`,
      email: `coordinator.${slug}@techastra.dev`,
      role: "coordinator",
      assignedEventId: event.id,
    });
    coordinators.push(coordinator);
    console.log(`Created coordinator for: ${event.name} (${coordinator.email})`);
  }

  // 3. Dummy registrations (spread across pending/approved/rejected)
  const registrations = [];
  let idx = 1;

  const approvedSeed = [
    { name: "Arun Kumar", email: "arun.kumar@example.com", college: COLLEGES[0], registerNo: "21CS001", eventIds: [codeRescue.id, trialOfTruth.id] },
    { name: "Divya Sree", email: "divya.sree@example.com", college: COLLEGES[1], registerNo: "21IT014", eventIds: [penVision.id] },
    { name: "Karthik Raja", email: "karthik.raja@example.com", college: COLLEGES[2], registerNo: "20EC022", eventIds: [pixelProtocol.id] },
    {
      name: "Meena Priya", email: "meena.priya@example.com", college: COLLEGES[0], registerNo: "21CS045",
      eventIds: [hackNexus.id], teamName: "Byte Busters",
      teamMembers: [
        { name: "Meena Priya", regNo: "21CS045", role: "lead" },
        { name: "Suresh Babu", regNo: "21CS046", role: "member" },
        { name: "Priyanka R", regNo: "21CS047", role: "member" },
      ],
    },
    { name: "Vignesh S", email: "vignesh.s@example.com", college: COLLEGES[3], registerNo: "21ME011", eventIds: [cryptClash.id] },
    { name: "Lakshmi Narayanan", email: "lakshmi.n@example.com", college: COLLEGES[1], registerNo: "21CS078", eventIds: [promptArena.id] },
    {
      name: "Ramya Devi", email: "ramya.devi@example.com", college: COLLEGES[2], registerNo: "21AI009",
      eventIds: [plotTwist.id], teamName: "NextGen Founders",
      teamMembers: [
        { name: "Ramya Devi", regNo: "21AI009", role: "lead" },
        { name: "Ashok Kumar", regNo: "21AI010", role: "member" },
      ],
    },
  ];

  for (const p of approvedSeed) {
    const { registration } = await createParticipantWithRegistration({
      ...p, status: "approved", txnPrefix: "UPI2026APR", index: idx,
    });
    registrations.push(registration);
    idx++;
  }

  const pendingSeed = [
    { name: "Bala Subramanian", email: "bala.s@example.com", college: COLLEGES[0], registerNo: "21CS002", eventIds: [codeRescue.id] },
    { name: "Nithya Shree", email: "nithya.shree@example.com", college: COLLEGES[3], registerNo: "21IT033", eventIds: [pixelProtocol.id] },
    { name: "Prakash Raj", email: "prakash.raj@example.com", college: COLLEGES[1], registerNo: "20EC055", eventIds: [trialOfTruth.id, promptArena.id] },
    { name: "Anitha Kumari", email: "anitha.k@example.com", college: COLLEGES[2], registerNo: "21CS091", eventIds: [penVision.id] },
  ];
  for (const p of pendingSeed) {
    const { registration } = await createParticipantWithRegistration({
      ...p, status: "pending", txnPrefix: "UPI2026PND", index: idx,
    });
    registrations.push(registration);
    idx++;
  }

  const rejectedSeed = [
    { name: "Gokul Nathan", email: "gokul.nathan@example.com", college: COLLEGES[0], registerNo: "21CS013", eventIds: [codeRescue.id], reason: "Transaction ID could not be matched to any payment" },
    { name: "Swathi M", email: "swathi.m@example.com", college: COLLEGES[3], registerNo: "21ME028", eventIds: [cryptClash.id], reason: "Duplicate registration for the same event" },
    { name: "Harish Chandra", email: "harish.c@example.com", college: COLLEGES[1], registerNo: "21IT061", eventIds: [pixelProtocol.id], reason: "Payment amount did not match event fee" },
  ];
  for (const p of rejectedSeed) {
    const { registration } = await createParticipantWithRegistration({
      name: p.name, email: p.email, college: p.college, registerNo: p.registerNo, eventIds: p.eventIds,
      status: "rejected", rejectionReason: p.reason, txnPrefix: "UPI2026REJ", index: idx,
    });
    registrations.push(registration);
    idx++;
  }

  console.log(`\nCreated ${registrations.length} sample registrations (7 approved, 4 pending, 3 rejected).`);

  // 4. Sample locked results (for Code Rescue and Hack Nexus) + certificates
  const codeRescueApproved = registrations.find((r) => r.eventIds.includes(codeRescue.id) && r.status === "approved");
  const hackNexusApproved = registrations.find((r) => r.eventIds.includes(hackNexus.id) && r.status === "approved");

  if (codeRescueApproved) {
    await prisma.result.create({
      data: { eventId: codeRescue.id, position: 1, registrationId: codeRescueApproved.id, lockedBy: coordinators[4].id },
    });
    console.log(`Locked result: ${codeRescueApproved.registrationCode} placed 1st in Code Rescue`);

    const certUser = await prisma.user.findUnique({ where: { id: codeRescueApproved.userId } });
    const code1 = `CERT${new Date().getFullYear()}-000001`;
    const pdfUrl1 = await generateCertificatePdf({
      certificateCode: code1,
      participantName: certUser.name,
      eventName: codeRescue.name,
      type: "winner",
      position: 1,
      collegeName: codeRescueApproved.collegeName,
    });
    await prisma.certificate.create({
      data: { certificateCode: code1, registrationId: codeRescueApproved.id, eventId: codeRescue.id, type: "winner", pdfUrl: pdfUrl1 },
    });
    console.log(`Generated demo winner certificate: ${code1}`);
  }

  if (hackNexusApproved) {
    await prisma.result.create({
      data: { eventId: hackNexus.id, position: 1, registrationId: hackNexusApproved.id, lockedBy: coordinators[1].id },
    });
    console.log(`Locked result: ${hackNexusApproved.registrationCode} placed 1st in Hack Nexus`);

    const certUser = await prisma.user.findUnique({ where: { id: hackNexusApproved.userId } });
    const code2 = `CERT${new Date().getFullYear()}-000002`;
    const pdfUrl2 = await generateCertificatePdf({
      certificateCode: code2,
      participantName: `${certUser.name} (${hackNexusApproved.teamName})`,
      eventName: hackNexus.name,
      type: "winner",
      position: 1,
      collegeName: hackNexusApproved.collegeName,
    });
    await prisma.certificate.create({
      data: { certificateCode: code2, registrationId: hackNexusApproved.id, eventId: hackNexus.id, type: "winner", pdfUrl: pdfUrl2 },
    });
    console.log(`Generated demo winner certificate: ${code2}`);

    // Also generate a plain participation certificate for a different approved reg
    const penVisionApproved = registrations.find((r) => r.eventIds.includes(penVision.id) && r.status === "approved");
    if (penVisionApproved) {
      const puser = await prisma.user.findUnique({ where: { id: penVisionApproved.userId } });
      const code3 = `CERT${new Date().getFullYear()}-000003`;
      const pdfUrl3 = await generateCertificatePdf({
        certificateCode: code3,
        participantName: puser.name,
        eventName: penVision.name,
        type: "participation",
        collegeName: penVisionApproved.collegeName,
      });
      await prisma.certificate.create({
        data: { certificateCode: code3, registrationId: penVisionApproved.id, eventId: penVision.id, type: "participation", pdfUrl: pdfUrl3 },
      });
      console.log(`Generated demo participation certificate: ${code3}`);
    }
  }

  // 5. A couple of sample announcements
  await prisma.announcement.create({
    data: { message: "Welcome to TechAstra 2026! Registration desks open at 8:00 AM.", createdBy: masterAdmin.id },
  });
  await prisma.announcement.create({
    data: { message: "Venue change: Crypt Clash has moved to Computer Lab 1 (Block C).", createdBy: masterAdmin.id },
  });

  console.log("\nSeeding complete.\n");
  console.log("All staff/demo accounts use the password:", DEMO_PASSWORD);
  console.log("See SEED_CREDENTIALS.md at the repo root for the full list of logins.");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/*
 * NOTE: To reset and reseed from a clean slate, run:
 *   npx prisma migrate reset
 * This drops and recreates the database, then automatically re-runs this
 * seed script (configured via the "prisma.seed" field in package.json).
 */
