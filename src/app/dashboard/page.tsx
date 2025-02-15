import { signOut } from 'next-auth/react';
import DashboardClient from './dashboard-client';
import { requireAuth } from '@/utils/auth';
import { redirect } from 'next/navigation';
export default async function DashboardPage() {
  try {
    const user = await requireAuth();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, name: user.name })
    })
    const data = await response.json()
    
    
    const userData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/`,{
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      }).then(res => res.json())
    

    return (
      <div className="min-h-screen bg-blue-50">
        <DashboardClient initialUserData={userData} token={data.token} />
      </div>
    );
  } catch (error) {
    signOut({ callbackUrl: '/' })
    redirect('/signin')
  }
}