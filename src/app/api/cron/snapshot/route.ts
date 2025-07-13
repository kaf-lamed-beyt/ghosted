import { takeSnapshot } from "@/lib/cron/snapshot";

export async function GET() {
  try {
    await takeSnapshot();
    return Response.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'failed' }, { status: 500 });
  }
}
