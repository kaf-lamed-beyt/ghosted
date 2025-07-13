import { db, Follower } from './db';
import { getCurrentUser } from './session';
import { Octokit } from 'octokit';
import pLimit from 'p-limit';

const limit = pLimit(5);

function getGhosts(previous: Follower[], current: Follower[]): Follower[] {
  const currentSet = new Set(current.map((f) => f.username));
  return previous.filter((f) => !currentSet.has(f.username));
}

export async function getFollowersAndGhosts() {
  const user = await getCurrentUser();
  if (!user) return { followers: [], ghosts: [] };

  const snapshots = await db().getRecentSnapshotsForUser(user.githubId);
  // need to cache the usernames i already have from previous snapshot in
  // the db to prevent dupes via octokit
  const usernames = new Set<string>(
    snapshots?.[0]?.map((f) => f.username) ?? []
  );
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

  const octokit = new Octokit({
    auth: user.token,
  });

  const res = await octokit.paginate(octokit.rest.users.listFollowersForUser, {
    username: user.username,
    per_page: 100,
  });

  // octokit.rest.users.follow({username: })

  const followers = (
    await Promise.all(
      res.map((f) =>
        // github includes rate-limiting to this endpoint
        // need to be wary of that, lol.
        limit(async () => {
          if (usernames.has(f.login)) {
            return snapshots?.[0]?.find(
              (snapshot) => snapshot.username === f.login
            );
          }
          const detail = await octokit.rest.users.getByUsername({
            username: f.login,
          });

          let isFollowing = false;
          try {
            await octokit.rest.users.checkFollowingForUser({
              username: user.username,
              target_user: f.login,
            });
            isFollowing = true;
          } catch (error) {
            console.error(error);
          }

          return {
            username: f.login,
            avatarUrl: f.avatar_url,
            bio: detail.data.bio ?? null,
            location: detail.data.location ?? null,
            githubId: user.githubId,
            fetchedAt: new Date(),
            name: detail.data.name ?? null,
            isFollowing,
          };
        })
      )
    )
  ).filter(Boolean) as Follower[];

  await db().addFollowers(followers, user.githubId);

  return {
    ghosts: [],
    followers,
  };
}
