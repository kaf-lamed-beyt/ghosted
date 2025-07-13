import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/session';
import Dashboard from '@/containers/dashboard';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  return <Dashboard user={user} />;
}
