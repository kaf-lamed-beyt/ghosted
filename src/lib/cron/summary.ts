import { db } from '@/lib/server/db';
import { sendEmail } from '@/lib/server/email';
import { takeSnapshot } from './snapshot';

export async function sendWeeklySummaries() {
  await takeSnapshot();
  const users = await db().humans();

  for (const user of users) {
    const currrentFollowers = await db().getFollowers(user.githubId);
    const ghosts = await db().getGhosts(user.id);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentGhosts = ghosts.filter((g) => g.unfollowedAt >= oneWeekAgo);
    const newFollowers = currrentFollowers.filter(
      (f) => f.firstFollowedAt >= oneWeekAgo
    );

    if (newFollowers.length === 0 && recentGhosts.length === 0) continue;
    newFollowers.sort((a, b) => a.username.localeCompare(b.username));
    recentGhosts.sort((a, b) => a.username.localeCompare(b.username));

    await sendEmail({
      to: String(user.email),
      username: user.username,
      newFollowers,
      ghosts: recentGhosts,
    });
  }
}
