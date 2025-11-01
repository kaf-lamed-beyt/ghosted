import { Follower, User } from './server/db';

interface TikTokFollowerResponse {
  data: {
    user_followers: Array<{
      display_name: string;
      username: string;
    }>;
    cursor: number;
    has_more: boolean;
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

interface TikTokUserInfoResponse {
  data: {
    user: {
      open_id: string;
      union_id: string;
      avatar_url: string;
      display_name: string;
      bio_description?: string;
      follower_count: number;
      following_count: number;
      likes_count: number;
      video_count: number;
    };
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

/**
 * get followers for a TikTok user using the TikTok Research API
 * for now, there's a limitation. this would fail because i don't have the
 * researcher API access. It available for everyone in the world except Africa.
 * what an unfortunate clime to find oneself
 */
export async function fetchTikTokFollowersForUser(
  user: User,
  authToken: string
): Promise<Follower[]> {
  const followers: Follower[] = [];
  let cursor: number | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      'https://open.tiktokapis.com/v2/research/user/followers/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          max_count: 100,
          ...(cursor && { cursor }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.statusText}`);
    }

    const data: TikTokFollowerResponse = await response.json();

    if (data.error) {
      throw new Error(`TikTok API error: ${data.error.message}`);
    }

    const mappedFollowers = data.data.user_followers.map((f) => ({
      username: f.username,
      platform: 'tiktok' as const,
      avatarUrl: undefined,
      fetchedAt: new Date(),
      userId: user.id,
      bio: null,
      location: null,
      name: f.display_name,
      isFollowing: false,
      firstFollowedAt: new Date(),
    }));

    followers.push(...mappedFollowers);

    hasMore = data.data.has_more;
    cursor = data.data.cursor;
  }

  return followers;
}

export async function getTikTokUserInfo(accessToken: string): Promise<{
  openId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
}> {
  const response = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,follower_count,following_count',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `TikTok API error: ${response.statusText} - ${responseText}`
    );
  }

  const data: TikTokUserInfoResponse = JSON.parse(responseText);

  // TikTok returns error.code="ok" on success
  // make e no go dey whine me. throw only if it's an actual error
  if (data.error && data.error.code !== 'ok') {
    throw new Error(`TikTok API error: ${data.error.message}`);
  }

  return {
    openId: data.data.user.open_id,
    username: data.data.user.open_id, // TikTok uses open_id as unique identifier
    displayName: data.data.user.display_name,
    avatarUrl: data.data.user.avatar_url,
    bio: data.data.user.bio_description,
    followerCount: data.data.user.follower_count,
    followingCount: data.data.user.following_count,
  };
}
