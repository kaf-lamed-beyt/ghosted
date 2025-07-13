import { redirect } from 'next/navigation';
import { getSession } from '@/lib/server/session';
import Dashboard from '@/containers/dashboard';

export default async function Page() {
  const user = await getSession();

  if (!user) {
    redirect('/');
  }

  return <Dashboard user={user} />;
}
