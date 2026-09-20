import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
    // Route matcher for protected application areas.
    matcher: ['/checkout/:path*', '/profile/:path*', '/orders/:path*', '/admin/:path*'],
};
