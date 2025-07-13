import { db } from '@/lib/server/db';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { githubId, username, isFollowing } = body;

  try {
    await db().updateFollowerFollowState({ githubId, username, isFollowing });
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}
