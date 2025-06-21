import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('NEXTAUTH_SECRET is not set');
      return NextResponse.json(null);
    }

    const token = await getToken({req: request});

    if (!token) {
      return NextResponse.json(null);
    }

    const payload = {
      email : token.email,
      name: token.name,
    }

    const signedPayload = jwt.sign(payload, secret, { expiresIn: '5m' });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: signedPayload }),
    });

    const data = await response.json();

    return NextResponse.json(data.token);
  } catch (error) {
    return NextResponse.json(null);
  }
}
