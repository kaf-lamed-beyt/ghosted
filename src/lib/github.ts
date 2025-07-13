import { Octokit } from 'octokit';
import pLimit from 'p-limit';
import { Follower, User } from './server/db';

const limit = pLimit(5);

export async function fetchGitHubFollowersForUser(
  user: User,
  authToken: string
): Promise<Follower[]> {
  const octokit = new Octokit({ auth: authToken });

  const githubFollowers = await octokit.paginate(
    octokit.rest.users.listFollowersForUser,
    {
      username: user.username,
      per_page: 100,
    }
  );

  return (
    await Promise.all(
      githubFollowers.map((f) =>
        limit(async () => {
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
          } catch {}

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
}
