import { db, Platform } from '@/lib/server/db';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, username, isFollowing, platform } = body as {
    userId: number;
    username: string;
    isFollowing: boolean;
    platform: Platform;
  };

  try {
    await db().updateFollowerFollowState({ userId, username, isFollowing, platform });
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}
