import { db, Ghost } from '@/lib/server/db';
import { GITHUB_PAT } from '../constants';
import { fetchGitHubFollowersForUser } from '../github';

export async function takeSnapshot() {
  const users = await db().humans();
  if (!users || users.length === 0) return;

  for (const user of users) {
    const newSnapshot = await fetchGitHubFollowersForUser(user, GITHUB_PAT!);
    const prevSnapshot = await db().getFollowers(user.githubId);

    const prevUsernames = new Set(prevSnapshot.map((f) => f.username));
    const newUsernames = new Set(newSnapshot.map((f) => f.username));

    if (newSnapshot.length > prevSnapshot.length) {
      // data is always fresh from GitHub so, pack from there like omi obe!
      const followers = newSnapshot.filter(
        (person) => !prevUsernames.has(person.username)
      );

      if (followers.length > 0)
        await db().addFollowers(followers, user.githubId);
    } else if (newSnapshot.length < prevSnapshot.length) {
      const unfollowers = prevSnapshot.filter(
        (person) => !newUsernames.has(person.username)
      );

      if (unfollowers.length > 0) {
        const ghosts: Ghost[] = unfollowers.map((ghost) => ({
          ...ghost,
          userId: user.id,
          unfollowedAt: new Date(),
        }));
        console.log('ghosts', ghosts);
        await db().addGhosts(ghosts, user.id);
      }
    } else {
      // Same length, definitely need to check if it is the same followers
      // list from before make my head no go dey spin again
      const isSameSet = [...newUsernames].every((username) =>
        prevUsernames.has(username)
      );

      if (!isSameSet) {
        // when someone unfollowed AND someone followed (net zero change)
        const newFollowers = newSnapshot.filter(
          (person) => !prevUsernames.has(person.username)
        );
        const unfollowers = prevSnapshot.filter(
          (person) => !newUsernames.has(person.username)
        );

        if (newFollowers.length > 0)
          await db().addFollowers(newFollowers, user.githubId);
        if (unfollowers.length > 0) {
          const ghosts: Ghost[] = unfollowers.map((ghost) => ({
            ...ghost,
            userId: user.id,
            unfollowedAt: new Date(),
          }));
          await db().addGhosts(ghosts, user.id);
        }
      } else {
        console.log(
          `No change in followers for ${user.username}. Skipping insert.`
        );
      }
    }
  }
}
