/**
 * Seed script for TechAstra Symposium Portal.
 *
 * Populates:
 *  - 8 demo events across tracks (placeholders - swap out once the real
 *    event list/timings/fees are finalized)
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

// Demo events - PLACEHOLDER DATA. Replace once the real event list is finalized.
function buildDemoEvents() {
  const day = (h, m = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // symposium day, 2 weeks out
    d.setHours(h, m, 0, 0);
    return d;
  };

  return [
    {
      name: "Coding Marathon",
      description: "A 3-hour competitive programming sprint across increasing difficulty tiers.",
      track: "Technical",
      category: "technical",
      startTime: day(9, 0),
      endTime: day(12, 0),
      fee: 150,
      maxSeats: 80,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Computer Lab 1",
      rulebook: "Individual event. Bring your own laptop. Languages allowed: C, C++, Java, Python. No internet access during the contest except the judge portal.",
    },
    {
      name: "Paper Presentation",
      description: "Present your research/technical paper to a panel of judges.",
      track: "Technical",
      category: "technical",
      startTime: day(9, 15),
      endTime: day(11, 0),
      fee: 100,
      maxSeats: 40,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Seminar Hall A",
      rulebook: "8 minutes presentation + 2 minutes Q&A. Submit slides 1 day prior via the help desk email.",
    },
    {
      name: "Hackathon",
      description: "Build a working prototype for the given problem statement in one day.",
      track: "Technical",
      category: "technical",
      startTime: day(9, 0),
      endTime: day(17, 0),
      fee: 300,
      maxSeats: 60,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      venue: "Main Auditorium",
      rulebook: "Teams of 2-4. Problem statements released at 9 AM sharp. Final demo at 4:30 PM.",
    },
    {
      name: "Tech Quiz",
      description: "General tech, CS fundamentals, and current-affairs quiz.",
      track: "Technical",
      category: "non_technical",
      startTime: day(10, 15),
      endTime: day(11, 0),
      fee: 50,
      maxSeats: 100,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 2,
      venue: "Seminar Hall B",
      rulebook: "Teams of 2. Prelims (written) followed by finals (on-stage) for the top 6 teams.",
    },
    {
      name: "Robo Race",
      description: "Build and race a line-following/obstacle bot through the arena.",
      track: "Robotics",
      category: "technical",
      startTime: day(11, 0),
      endTime: day(13, 0),
      fee: 250,
      maxSeats: 30,
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 3,
      venue: "Robotics Arena",
      rulebook: "Bots must fit within 25x25x25 cm at start. Two attempts per team, best time counts.",
    },
    {
      name: "Web Design Contest",
      description: "Design and build a responsive webpage from a surprise theme, live.",
      track: "Design",
      category: "technical",
      startTime: day(13, 0),
      endTime: day(15, 0),
      fee: 120,
      maxSeats: 50,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Computer Lab 2",
      rulebook: "Individual event. Theme revealed at start. HTML/CSS/JS only, no frameworks.",
    },
    {
      name: "Poster Presentation",
      description: "Visually communicate a technical concept or project via a poster.",
      track: "Technical",
      category: "technical",
      startTime: day(9, 30),
      endTime: day(11, 30),
      fee: 80,
      maxSeats: 45,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Exhibition Hall",
      rulebook: "A1 size poster, printed and brought by the participant. Judging is continuous through the session.",
    },
    {
      name: "Startup Pitch",
      description: "Pitch a business/startup idea to a panel of judges, shark-tank style.",
      track: "Entrepreneurship",
      category: "non_technical",
      startTime: day(14, 0),
      endTime: day(16, 0),
      fee: 200,
      maxSeats: 25,
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 4,
      venue: "Seminar Hall A",
      rulebook: "5 minute pitch + 3 minutes Q&A. Slide deck of max 10 slides.",
    },
    // Extra non-technical events so the Non-Technical branch of the
    // mega-menu / Events filter is populated with more than one item.
    {
      name: "Treasure Hunt",
      description: "A campus-wide clue-solving chase against the clock, in teams.",
      track: "General",
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
      name: "Gaming Tournament",
      description: "Competitive multiplayer gaming brackets across popular titles.",
      track: "General",
      category: "non_technical",
      startTime: day(13, 30),
      endTime: day(16, 30),
      fee: 100,
      maxSeats: 64,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Gaming Zone",
      rulebook: "Single-elimination brackets. Bring your own peripherals if you prefer; rigs are provided.",
    },
    {
      name: "Photography Contest",
      description: "Capture the theme of the day - best shots judged live on the big screen.",
      track: "General",
      category: "non_technical",
      startTime: day(9, 0),
      endTime: day(15, 0),
      fee: 70,
      maxSeats: 50,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      venue: "Exhibition Hall",
      rulebook: "Theme announced at 9 AM. Submit up to 3 shots by 2 PM. Minimal editing allowed (crop/exposure only).",
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
  const [coding, paper, hackathon, quiz, robo, webdesign, poster, pitch] = events;

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
    { name: "Arun Kumar", email: "arun.kumar@example.com", college: COLLEGES[0], registerNo: "21CS001", eventIds: [coding.id, quiz.id] },
    { name: "Divya Sree", email: "divya.sree@example.com", college: COLLEGES[1], registerNo: "21IT014", eventIds: [paper.id] },
    { name: "Karthik Raja", email: "karthik.raja@example.com", college: COLLEGES[2], registerNo: "20EC022", eventIds: [webdesign.id] },
    {
      name: "Meena Priya", email: "meena.priya@example.com", college: COLLEGES[0], registerNo: "21CS045",
      eventIds: [hackathon.id], teamName: "Byte Busters",
      teamMembers: [
        { name: "Meena Priya", regNo: "21CS045", role: "lead" },
        { name: "Suresh Babu", regNo: "21CS046", role: "member" },
        { name: "Priyanka R", regNo: "21CS047", role: "member" },
      ],
    },
    { name: "Vignesh S", email: "vignesh.s@example.com", college: COLLEGES[3], registerNo: "21ME011", eventIds: [robo.id] },
    { name: "Lakshmi Narayanan", email: "lakshmi.n@example.com", college: COLLEGES[1], registerNo: "21CS078", eventIds: [poster.id] },
    {
      name: "Ramya Devi", email: "ramya.devi@example.com", college: COLLEGES[2], registerNo: "21AI009",
      eventIds: [pitch.id], teamName: "NextGen Founders",
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
    { name: "Bala Subramanian", email: "bala.s@example.com", college: COLLEGES[0], registerNo: "21CS002", eventIds: [coding.id] },
    { name: "Nithya Shree", email: "nithya.shree@example.com", college: COLLEGES[3], registerNo: "21IT033", eventIds: [webdesign.id] },
    { name: "Prakash Raj", email: "prakash.raj@example.com", college: COLLEGES[1], registerNo: "20EC055", eventIds: [quiz.id, poster.id] },
    { name: "Anitha Kumari", email: "anitha.k@example.com", college: COLLEGES[2], registerNo: "21CS091", eventIds: [paper.id] },
  ];
  for (const p of pendingSeed) {
    const { registration } = await createParticipantWithRegistration({
      ...p, status: "pending", txnPrefix: "UPI2026PND", index: idx,
    });
    registrations.push(registration);
    idx++;
  }

  const rejectedSeed = [
    { name: "Gokul Nathan", email: "gokul.nathan@example.com", college: COLLEGES[0], registerNo: "21CS013", eventIds: [coding.id], reason: "Transaction ID could not be matched to any payment" },
    { name: "Swathi M", email: "swathi.m@example.com", college: COLLEGES[3], registerNo: "21ME028", eventIds: [robo.id], reason: "Duplicate registration for the same event" },
    { name: "Harish Chandra", email: "harish.c@example.com", college: COLLEGES[1], registerNo: "21IT061", eventIds: [webdesign.id], reason: "Payment amount did not match event fee" },
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

  // 4. Sample locked results (for Coding Marathon and Hackathon) + certificates
  const codingApproved = registrations.find((r) => r.eventIds.includes(coding.id) && r.status === "approved");
  const hackathonApproved = registrations.find((r) => r.eventIds.includes(hackathon.id) && r.status === "approved");

  if (codingApproved) {
    await prisma.result.create({
      data: { eventId: coding.id, position: 1, registrationId: codingApproved.id, lockedBy: coordinators[0].id },
    });
    console.log(`Locked result: ${codingApproved.registrationCode} placed 1st in Coding Marathon`);

    const certUser = await prisma.user.findUnique({ where: { id: codingApproved.userId } });
    const code1 = `CERT${new Date().getFullYear()}-000001`;
    const pdfUrl1 = await generateCertificatePdf({
      certificateCode: code1,
      participantName: certUser.name,
      eventName: coding.name,
      type: "winner",
      position: 1,
      collegeName: codingApproved.collegeName,
    });
    await prisma.certificate.create({
      data: { certificateCode: code1, registrationId: codingApproved.id, eventId: coding.id, type: "winner", pdfUrl: pdfUrl1 },
    });
    console.log(`Generated demo winner certificate: ${code1}`);
  }

  if (hackathonApproved) {
    await prisma.result.create({
      data: { eventId: hackathon.id, position: 1, registrationId: hackathonApproved.id, lockedBy: coordinators[2].id },
    });
    console.log(`Locked result: ${hackathonApproved.registrationCode} placed 1st in Hackathon`);

    const certUser = await prisma.user.findUnique({ where: { id: hackathonApproved.userId } });
    const code2 = `CERT${new Date().getFullYear()}-000002`;
    const pdfUrl2 = await generateCertificatePdf({
      certificateCode: code2,
      participantName: `${certUser.name} (${hackathonApproved.teamName})`,
      eventName: hackathon.name,
      type: "winner",
      position: 1,
      collegeName: hackathonApproved.collegeName,
    });
    await prisma.certificate.create({
      data: { certificateCode: code2, registrationId: hackathonApproved.id, eventId: hackathon.id, type: "winner", pdfUrl: pdfUrl2 },
    });
    console.log(`Generated demo winner certificate: ${code2}`);

    // Also generate a plain participation certificate for a different approved reg
    const paperApproved = registrations.find((r) => r.eventIds.includes(paper.id) && r.status === "approved");
    if (paperApproved) {
      const puser = await prisma.user.findUnique({ where: { id: paperApproved.userId } });
      const code3 = `CERT${new Date().getFullYear()}-000003`;
      const pdfUrl3 = await generateCertificatePdf({
        certificateCode: code3,
        participantName: puser.name,
        eventName: paper.name,
        type: "participation",
        collegeName: paperApproved.collegeName,
      });
      await prisma.certificate.create({
        data: { certificateCode: code3, registrationId: paperApproved.id, eventId: paper.id, type: "participation", pdfUrl: pdfUrl3 },
      });
      console.log(`Generated demo participation certificate: ${code3}`);
    }
  }

  // 5. A couple of sample announcements
  await prisma.announcement.create({
    data: { message: "Welcome to TechAstra 2026! Registration desks open at 8:00 AM.", createdBy: masterAdmin.id },
  });
  await prisma.announcement.create({
    data: { message: "Venue change: Robo Race has moved to the Robotics Arena (Block C).", createdBy: masterAdmin.id },
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
