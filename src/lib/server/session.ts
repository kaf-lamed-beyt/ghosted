import { cookies } from 'next/headers';
import { db, User } from './db';
import { antagonist } from '../crypto';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get('ghosted_sesh')?.value;

  if (!value) return null;

  const data = antagonist(value);
  let session: { id: number; token: string };
  try {
    session = JSON.parse(String(data));
  } catch (error) {
    console.error(error);
    return null;
  }

  if (!session?.id || isNaN(session.id)) return null;

  const user = await db().getUserByGitHubId(session.id);
  return user ? { ...user, token: session.token } : null;
}
