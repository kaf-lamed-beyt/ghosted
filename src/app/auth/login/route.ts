import { NextResponse } from 'next/server';

const { NEXT_PUBLIC_APP_URL, GITHUB_CLIENT_ID } = process.env;
export async function GET() {
  const redirectUri = `${NEXT_PUBLIC_APP_URL}/auth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user%20user:email`;
  return NextResponse.redirect(url);
}
