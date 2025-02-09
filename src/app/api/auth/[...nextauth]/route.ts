import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
    } & DefaultSession['user']
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user) {
        return false;
      }

      console.log('signIn', user, account);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: user.email, 
            name: user.name,
          }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };