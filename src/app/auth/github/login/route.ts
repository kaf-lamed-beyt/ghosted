import { GITHUB_CLIENT_ID, NEXT_PUBLIC_APP_URL } from '@/lib/constants';
import { NextResponse } from 'next/server';

export async function GET() {
  const redirectUri = `${NEXT_PUBLIC_APP_URL}/auth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user%20user:email%20user:follow`;
  return NextResponse.redirect(url);
}
