import { Platform } from '../server/db';

export type FollowStateUpdateParams = {
  userId: number;
  username: string;
  isFollowing: boolean;
  platform: Platform;
};

export const updateFollowState = async (params: FollowStateUpdateParams) => {
  return await fetch('/api/followers/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: params.userId,
      username: params.username,
      isFollowing: params.isFollowing,
      platform: params.platform,
    }),
  });
};
