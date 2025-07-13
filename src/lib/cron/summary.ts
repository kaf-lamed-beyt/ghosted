import { db } from '@/lib/server/db';
import { sendEmail } from '@/lib/server/email';

export async function sendWeeklySummaries() {
  const users = await db().humans();

  for (const user of users) {
    const snapshots = await db().getRecentSnapshotsForUser(user.githubId);

    if (snapshots.length < 2) continue;
    const [latest, previous] = snapshots;

    const currentSet = new Set(latest.map((f) => f.username));
    const previousSet = new Set(previous.map((f) => f.username));

    const newFollowers = latest.filter((f) => !previousSet.has(f.username));
    const ghosts = previous.filter((f) => !currentSet.has(f.username));

    if (newFollowers.length === 0 && ghosts.length === 0) continue;

    await sendEmail({
      to: String(user.email),
      username: user.username,
      newFollowers,
      ghosts,
    });
  }
}
