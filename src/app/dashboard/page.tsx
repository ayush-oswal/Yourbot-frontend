import { requireAuth } from '@/utils/auth';

export default async function DashboardPage() {
  const user = await requireAuth();


  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {/* Dashboard content */}
    </div>
  );
}