import { takeSnapshot } from '@/lib/cron/snapshot';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

export async function handler() {
  try {
    await takeSnapshot();
    return Response.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'failed' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
