export const DEFAULT_ADMIN_EMAILS = [
  'krjha1212@gmail.com',
];

export function getAuthorizedAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
    : [];
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envAdmins]));
}

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const allowed = getAuthorizedAdminEmails();
  return allowed.includes(cleanEmail);
}
