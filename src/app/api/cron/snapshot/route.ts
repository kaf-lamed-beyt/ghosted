import { takeSnapshot } from '@/lib/cron/snapshot';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

// export const POST = verifySignatureAppRouter(async () => {
//   try {
//     await takeSnapshot();
//     return Response.json({ status: 'ok' });
//   } catch (error) {
//     console.error(error);
//     return Response.json({ error: 'failed' }, { status: 500 });
//   }
// });

export async function GET() {
  try {
    const res = await takeSnapshot();
    return Response.json({ status: 'ok', data: res  });
  } catch (error) {
    console.error(error);
  }
}
