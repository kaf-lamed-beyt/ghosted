import {
  NEXT_PUBLIC_APP_URL,
  NODE_ENV,
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
} from '@/lib/constants';
import { protector } from '@/lib/crypto';
import { db } from '@/lib/server/db';
import { welcome } from '@/lib/server/email';
import { getTikTokUserInfo } from '@/lib/tiktok';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code)
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  // Exchange authorization code for access token
  const tokenReq = await fetch(
    'https://open.tiktokapis.com/v2/oauth/token/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY!,
        client_secret: TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${NEXT_PUBLIC_APP_URL}/auth/tiktok/callback`,
      }),
    }
  );

  // Log the response for debugging
  const responseText = await tokenReq.text();
  console.log('TikTok token response status:', tokenReq.status);
  console.log('TikTok token response:', responseText);

  // Try to parse as JSON
  let tokenData;
  try {
    tokenData = JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse TikTok response as JSON');
    return NextResponse.json(
      { error: 'Invalid response from TikTok', details: responseText.substring(0, 200) },
      { status: 500 }
    );
  }

  if (tokenData.error) {
    return NextResponse.json(
      { error: tokenData.error.message || 'Token exchange failed' },
      { status: 400 }
    );
  }

  const access_token = tokenData.access_token;
  const open_id = tokenData.open_id;

  if (!access_token || !open_id)
    return NextResponse.json(
      { error: 'No token or open_id found' },
      { status: 400 }
    );

  let userInfo;
  try {
    userInfo = await getTikTokUserInfo(access_token);
  } catch (error) {
    console.error('Error fetching TikTok user info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    );
  }

  const platformId = open_id;
  const platform = 'tiktok';

  const human = await db().human(platformId, platform);
  if (!human) {
    await db().createUser({
      platform,
      platformId,
      username: userInfo.displayName, // TikTok uses display name as username
      avatarUrl: userInfo.avatarUrl,
      // TikTok doesn't provide email in basic scopes
      // i'd look into why later. i'm prettry sure there's a way around it.
      email: null,
      createdAt: new Date(),
      following: userInfo.followingCount,
      followers: userInfo.followerCount,
      name: userInfo.displayName,
      bio: userInfo.bio || null,
      // TikTok doesn't provide location in the basic API access
      location: null,
    });
  }

  // this may end up being useless since there's no specific
  // way to obtain the user's email
  await welcome({
    email: null,
    platform: platform,
    platformId: platformId,
    name: userInfo.displayName,
    createdAt: human?.createdAt || new Date(),
  });

  const cookieStore = await cookies();

  const session = JSON.stringify({
    platformId,
    platform,
    token: access_token,
  });

  cookieStore.set({
    name: 'ghosted_sesh',
    value: protector(session),
    httpOnly: true,
    path: '/',
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirect('/dashboard');
}
