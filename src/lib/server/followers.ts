import { fetchGitHubFollowersForUser } from '../github';
import { db } from './db';
import { getSession } from './session';

export async function getFollowersAndGhosts() {
  const user = await getSession();
  if (!user || !user.token) return { followers: [], ghosts: [] };

  const followers = await db().getFollowers(user.githubId);
  const ghosts = await db().getGhosts(user.id);

  if (followers.length !== 0) {
    return {
      followers,
      ghosts,
    };
  }

  const freshFollowers = await fetchGitHubFollowersForUser(user, user.token);
  await db().addFollowers(freshFollowers, user.githubId);

  return {
    followers: freshFollowers,
    ghosts,
  };
}
