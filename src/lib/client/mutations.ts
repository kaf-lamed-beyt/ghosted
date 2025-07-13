export type FollowStateUpdateParams = {
  githubId: number;
  username: string;
  isFollowing: boolean;
};

export const updateFollowState = async (params: FollowStateUpdateParams) => {
  return await fetch('/api/followers/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      githubId: params.githubId,
      username: params.username,
      isFollowing: params.isFollowing,
    }),
  });
};
