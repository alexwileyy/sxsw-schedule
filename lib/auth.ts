// Who is allowed to sign in. This app is single-user for now; add more emails
// here (lowercase) to open it up later. Enforced in the OAuth callback and in
// middleware, and backed by row-level security on the picks table.
export const ALLOWED_EMAILS = ["alex@alexwiley.co.uk"];

export function isAllowedEmail(email?: string | null): boolean {
  return !!email && ALLOWED_EMAILS.includes(email.toLowerCase());
}
