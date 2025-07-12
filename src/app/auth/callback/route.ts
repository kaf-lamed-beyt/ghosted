import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  NODE_ENV,
} from '@/lib/constants';
import { protector } from '@/lib/crypto';
import { db } from '@/lib/server/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code)
    return NextResponse.json({ error: 'Mssing code' }, { status: 400 });

  const tokenReq = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      code,
      client_id: GITHUB_CLIENT_ID!,
      client_secret: GITHUB_CLIENT_SECRET!,
    }),
  });

  const data = await tokenReq.json();
  const access_token = data?.access_token;
  if (!access_token)
    return NextResponse.json({ error: 'No token found' }, { status: 400 });

  const githubUser = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const emailRes = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const user = await githubUser.json();
  const emails = await emailRes.json();
  const primaryEmail = Array.isArray(emails)
    ? emails.find((e) => e.primary && e.verified)?.email
    : null;

  await db().createUser({
    githubId: user.id,
    username: user.login,
    avatarUrl: user.avatar_url,
    email: primaryEmail,
    createdAt: new Date(),
  });

  const cookieStore = await cookies()

  cookieStore.set({
    name: 'ghosted_sesh',
    value: protector(String(user.id)),
    httpOnly: true,
    path: '/',
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirect('/dashboard');
}
