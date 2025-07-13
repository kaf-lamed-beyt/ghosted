import { db } from '@/lib/server/db';
import { GITHUB_PAT } from '../constants';
import { fetchGitHubFollowersForUser } from '../github';

export async function takeSnapshot() {
  const users = await db().humans();
  if (!users || users.length === 0) return;

  for (const user of users) {
    const newSnapshot = await fetchGitHubFollowersForUser(user, GITHUB_PAT!);
    await db().addFollowers(newSnapshot, user.githubId);
  }
}
