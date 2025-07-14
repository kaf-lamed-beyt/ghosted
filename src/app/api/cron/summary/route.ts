import { sendWeeklySummaries } from '@/lib/cron/summary';

export async function GET() {
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
}
