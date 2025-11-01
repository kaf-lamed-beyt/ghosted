import { db, Follower, Ghost, User } from '@/lib/server/db';
import { GITHUB_PAT } from '../constants';
import { fetchGitHubFollowersForUser } from '../github';
import { fetchTikTokFollowersForUser } from '../tiktok';

async function fetchFollowersForPlatform(user: User, token: string): Promise<Follower[]> {
  if (user.platform === 'github') {
    return await fetchGitHubFollowersForUser(user, token);
  } else if (user.platform === 'tiktok') {
    return await fetchTikTokFollowersForUser(user, token);
  }
  throw new Error(`Unsupported platform: ${user.platform}`);
}

export async function takeSnapshot() {
  const users = await db().humans();
  if (!users || users.length === 0) return;

  for (const user of users) {
    // Use the user's stored token (from session) or platform-specific token
    const token = user.platform === 'github' ? GITHUB_PAT! : user.token!;
    
    const newSnapshot = await fetchFollowersForPlatform(user, token);
    const prevSnapshot = await db().getFollowers(user.id, user.platform);

    const prevUsernames = new Set(prevSnapshot.map((f) => f.username));
    const newUsernames = new Set(newSnapshot.map((f) => f.username));

    const ghosts = await db().getGhosts(user.id, user.platform);
    const ghostUsernames = new Set(ghosts.map((g) => g.username));

    const followers = await db().getFollowers(user.id, user.platform);
    const ghostsInTheFollowersList = followers.filter((f) =>
      ghostUsernames.has(f.username)
    );

    if (ghostsInTheFollowersList.length > 0) {
      await db().removeFollowers(
        ghostsInTheFollowersList.map((g) => g.username),
        user.id,
        user.platform
      );
      console.log(
        'removed ghosts from the followers list',
        ghostsInTheFollowersList
      );
    }

    if (newSnapshot.length > prevSnapshot.length) {
      // data is always fresh from GitHub so, pack from there like omi obe!
      const followers = newSnapshot.filter(
        (person) => !prevUsernames.has(person.username)
      );

      if (followers.length > 0) {
        // checking to see if this user has re-followers and update the ghosts list
        const reFollowers = followers.filter((f) =>
          ghostUsernames.has(f.username)
        );
        if (reFollowers.length > 0)
          await db().removeGhosts(
            reFollowers.map((f) => f.username),
            user.id,
            user.platform
          );
      }
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
        await db().addGhosts(ghosts, user.id, user.platform);
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

        if (newFollowers.length > 0) {
          await db().addFollowers(newFollowers, user.id, user.platform);

          const reFollowers = newFollowers.filter((f) =>
            ghostUsernames.has(f.username)
          );
          if (reFollowers.length > 0)
            await db().removeGhosts(
              reFollowers.map((f) => f.username),
              user.id,
              user.platform
            );
        }
        if (unfollowers.length > 0) {
          const ghosts: Ghost[] = unfollowers.map((ghost) => ({
            ...ghost,
            userId: user.id,
            unfollowedAt: new Date(),
          }));
          await db().addGhosts(ghosts, user.id, user.platform);
        }
      } else {
        console.log(
          `No change in followers for ${user.username}. Skipping insert.`
        );
      }
    }
  }
}
