import { getFollowersAndGhosts } from '@/lib/server/followers';

export async function GET() {
  try {
    const data = await getFollowersAndGhosts();
    return Response.json(data);
  } catch (error) {
    console.error('Error: ', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
