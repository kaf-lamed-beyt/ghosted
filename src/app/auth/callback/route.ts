import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  NODE_ENV,
} from '@/lib/constants';
import { protector } from '@/lib/crypto';
import { db } from '@/lib/server/db';
import { welcome } from '@/lib/server/email';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';

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

  const octokit = new Octokit();
  const user = await octokit.rest.users.getAuthenticated({
    headers: { authorization: `Bearer ${access_token}` },
  });
  const emailList = await octokit.rest.users.listEmailsForAuthenticatedUser({
    headers: { authorization: `Bearer ${access_token}` },
  });

  const emails = emailList.data;
  const primaryEmail = Array.isArray(emails)
    ? emails.find((e) => e.primary && e.verified)?.email
    : null;

  await db().createUser({
    githubId: user.data.id,
    username: user.data.login,
    avatarUrl: user.data.avatar_url,
    email: primaryEmail,
    createdAt: new Date(),
    following: user.data.following,
    followers: user.data.followers,
    name: user.data.name,
    bio: user.data.bio,
    location: user.data.location,
  });

  await welcome({
    githubId: user.data.id,
    email: primaryEmail,
    name: user.data.name,
  });

  const cookieStore = await cookies();

  const session = JSON.stringify({
    id: user.data.id,
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
