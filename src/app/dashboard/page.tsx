import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/server/session';

export default async function Dashboard() {
  const user = await getCurrentUser();

  console.log('user', user)

  if (!user) {
    redirect('/');
  }

  return (
    <div>
      <h1>Welcome @{user.username} 👋</h1>
      <img src={user.avatarUrl} alt="avatar" width={60} height={100} />
    </div>
  );
}
