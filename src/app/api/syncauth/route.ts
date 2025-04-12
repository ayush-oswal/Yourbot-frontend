import { requireAuth } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await requireAuth();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, name: user.name })
    });

    const data = await response.json();

    return NextResponse.json(data.token);
  } catch (error) {
    return NextResponse.json(null);
  }
}
