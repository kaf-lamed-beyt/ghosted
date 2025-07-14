import { sendWeeklySummaries } from '@/lib/cron/summary';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

export const POST = verifySignatureAppRouter(async () => {
  try {
    await sendWeeklySummaries();
    return Response.json({ status: 'ok' });
  } catch (error) {
    console.error('Weekly summary failed:', error);
    return Response.json(
      { error: 'failed to send summaries' },
      { status: 500 }
    );
  }
});
