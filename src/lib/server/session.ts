import { cookies } from 'next/headers';
import { db, Platform, User } from './db';
import { antagonist } from '../crypto';

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get('ghosted_sesh')?.value;

  if (!value) return null;

  const data = antagonist(value);
  let session: { platformId: string; platform: Platform; token: string };
  try {
    session = JSON.parse(String(data));
  } catch (error) {
    console.error(error);
    return null;
  }

  if (!session?.platformId || !session?.platform) return null;

  const user = await db().human(session.platformId, session.platform);
  return user ? { ...user, token: session.token } : null;
}
