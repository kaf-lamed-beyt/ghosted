import { fetchGitHubFollowersForUser } from '../github';
import { fetchTikTokFollowersForUser } from '../tiktok';
import { db, Follower, User } from './db';
import { getSession } from './session';

async function fetchFollowersForPlatform(user: User, token: string): Promise<Follower[]> {
  if (user.platform === 'github') {
    return await fetchGitHubFollowersForUser(user, token);
  } else if (user.platform === 'tiktok') {
    return await fetchTikTokFollowersForUser(user, token);
  }
  throw new Error(`Unsupported platform: ${user.platform}`);
}

export async function getFollowersAndGhosts() {
  const user = await getSession();
  if (!user || !user.token) return { followers: [], ghosts: [] };

  const followers = await db().getFollowers(user.id, user.platform);
  const ghosts = await db().getGhosts(user.id, user.platform);

  if (followers.length !== 0) {
    return {
      followers,
      ghosts,
    };
  }

  const freshFollowers = await fetchFollowersForPlatform(user, user.token);
  await db().addFollowers(freshFollowers, user.id, user.platform);

  return {
    followers: freshFollowers,
    ghosts,
  };
}
