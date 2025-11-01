import { NEXT_PUBLIC_APP_URL, TIKTOK_CLIENT_KEY } from '@/lib/constants';
import { redirect } from 'next/navigation';

export async function GET() {
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY!,
    scope: 'user.info.basic,user.info.profile,user.info.stats',
    response_type: 'code',
    redirect_uri: `${NEXT_PUBLIC_APP_URL!}/auth/tiktok/callback`,
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

  return redirect(authUrl);
}
