/**
 * Admin authorization and security utilities for PMVerse Admin Portal
 */

export const DEFAULT_ADMIN_EMAILS = [
  'krjha1212@gmail.com',
];

export function getAuthorizedAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];

  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...fromEnv]));
}

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const allowed = getAuthorizedAdminEmails();
  return allowed.includes(cleanEmail);
}
