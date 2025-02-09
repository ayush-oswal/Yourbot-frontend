'use client';

import { signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export function SignInButton() {
  return (
    <button 
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="flex items-center justify-center w-full px-4 py-3 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
    >
      <FcGoogle className="w-6 h-6 mr-2" />
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    signOut({ callbackUrl: '/' });
  };

  return (
    <Button 
      onClick={handleSignOut}
      variant="ghost"
    >
      Sign out
    </Button>
  );
}