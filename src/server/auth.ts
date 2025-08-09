// Placeholder for future auth integration (NextAuth/JWT)
export type SessionUser = { id: string; email: string } | null;
export async function getSessionUser(): Promise<SessionUser> {
  return null;
}


