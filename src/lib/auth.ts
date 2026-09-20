import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();

                const email = String(credentials?.email || '').trim().toLowerCase();
                const password = String(credentials?.password || '');
                if (!email || !password) return null;

                const user = await User.findOne({ email: email });

                if (user && await bcrypt.compare(password, user.password)) {
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        isAdmin: user.role === 'admin',
                        role: user.role,
                    };
                }
                return null;
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days session persistence
    },
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }: any) {
            if (account?.provider === 'google' || account?.provider === 'facebook') {
                await dbConnect();
                try {
                    const existingUser = await User.findOne({ email: user.email });
                    if (!existingUser) {
                        const newUser = new User({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: 'user', // Map to role
                            password: bcrypt.hashSync(Math.random().toString(36).slice(-10)),
                        });
                        await newUser.save();
                        user.id = newUser._id.toString();
                        user.isAdmin = false;
                        user.role = 'user';
                    } else {
                        user.id = existingUser._id.toString();
                        user.isAdmin = existingUser.role === 'admin';
                        user.role = existingUser.role;
                    }
                    return true;
                } catch (error) {
                    console.error('Error during social sign-in:', error);
                    return false;
                }
            }
            return true;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
});
