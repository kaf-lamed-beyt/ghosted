import { db } from '@/lib/server/db';
import { GITHUB_PAT } from '../constants';
import { fetchGitHubFollowersForUser } from '../github';

export async function takeSnapshot() {
  const users = await db().humans();
  if (!users || users.length === 0) return;

  for (const user of users) {
    const newSnapshot = await fetchGitHubFollowersForUser(user, GITHUB_PAT!);
    const prevSnapshots = await db().getRecentSnapshotsForUser(user.githubId);
    const latestSnapshot = prevSnapshots[0] ?? [];

    const prevUsernames = new Set(latestSnapshot.map((f) => f.username));
    const newUsernames = new Set(newSnapshot.map((f) => f.username));

    const isSameLength = prevUsernames.size === newUsernames.size;
    const isSameSet =
      isSameLength &&
      [...newUsernames].every((username) => prevUsernames.has(username));

    if (isSameSet) {
      console.log(
        `No change in snapshot for ${user.username}. Skipping insert.`
      );
      continue;
    }

    await db().addFollowers(newSnapshot, user.githubId);
    console.log(`New snapshot inserted for ${user.username}`);
  }
}
