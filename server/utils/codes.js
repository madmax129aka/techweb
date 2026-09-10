/**
 * Human-readable code generators for registrations and certificates.
 * Format: SYM2026-0042, CERT2026-000123
 */

function pad(num, size) {
  return String(num).padStart(size, "0");
}

function currentSymposiumYear() {
  return new Date().getFullYear();
}

async function generateRegistrationCode(prisma) {
  const year = currentSymposiumYear();
  const count = await prisma.registration.count();
  return `SYM${year}-${pad(count + 1, 4)}`;
}

async function generateCertificateCode(prisma) {
  const year = currentSymposiumYear();
  const count = await prisma.certificate.count();
  return `CERT${year}-${pad(count + 1, 6)}`;
}

module.exports = { generateRegistrationCode, generateCertificateCode };
