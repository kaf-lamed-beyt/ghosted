import { fetchGitHubFollowersForUser } from '../github';
import { db, Follower } from './db';
import { getSession } from './session';

function getGhosts(previous: Follower[], current: Follower[]): Follower[] {
  const currentSet = new Set(current.map((f) => f.username));
  return previous.filter((f) => !currentSet.has(f.username));
}

export async function getFollowersAndGhosts() {
  const user = await getSession();
  if (!user || !user.token) return { followers: [], ghosts: [] };

  const snapshots = await db().getRecentSnapshotsForUser(user.githubId);

  if (snapshots.length >= 2) {
    const [latest, previous] = snapshots;
    const ghosts = getGhosts(previous, latest).sort((a, b) =>
      a.username.localeCompare(b.username)
    );

    return {
      followers: latest,
      ghosts,
    };
  }

  const freshFollowers = await fetchGitHubFollowersForUser(user, user.token);

  await db().addFollowers(freshFollowers, user.githubId);

  return {
    followers: freshFollowers,
    ghosts: [],
  };
}
