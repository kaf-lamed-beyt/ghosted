import { cookies } from 'next/headers';
import { db, User } from './db';
import { antagonist } from '../crypto';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get('ghosted_sesh')?.value;

  if (!value) return null;

  const id = antagonist(value);
  const userId = Number(id);

  if (!userId || isNaN(userId)) return null;

  const user = await db().getUserByGitHubId(userId);
  return user ?? null;
}
