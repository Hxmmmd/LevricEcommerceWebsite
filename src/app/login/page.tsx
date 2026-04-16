'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError('Invalid email or password');
            } else {
                // Fetch the session to check isAdmin flag
                const sessionRes = await fetch('/api/auth/session');
                const session = await sessionRes.json();

                if (session?.user?.isAdmin) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
                router.refresh();
            }
        } catch (err: unknown) {
            if (err instanceof Error){
                setError(err.message);
            }
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <div className="grow flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8 p-8 border border-white/10 rounded-[2.5rem] bg-white/5 backdrop-blur-md relative overflow-hidden group">
                    {/* Glowing background effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-700" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[100px] rounded-full group-hover:bg-purple-600/20 transition-all duration-700" />

                    <div className="relative text-center space-y-2">
                        <h2 className="text-4xl font-black tracking-tighter text-white">Welcome Back</h2>
                        <p className="text-sm text-muted-foreground font-medium italic">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="relative space-y-6" autoComplete="off">
                        {/* Honeypot to catch browser autofill */}
                        <input type="text" style={{ display: 'none' }} aria-hidden="true" />
                        <input type="password" style={{ display: 'none' }} aria-hidden="true" />

                        {error && (
                            <div className="relative bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-black uppercase text-gray-500 tracking-widest pl-1">Email</label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    data-lpignore="true"
                                    readOnly
                                    onFocus={(e) => e.target.removeAttribute('readOnly')}
                                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="Enter your email"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-xs font-black uppercase text-gray-500 tracking-widest pl-1">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="off"
                                    data-lpignore="true"
                                    readOnly
                                    onFocus={(e) => e.target.removeAttribute('readOnly')}
                                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 pl-12 pr-14 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full py-7 rounded-2xl font-black text-lg bg-white text-black hover:bg-gray-200 shadow-2xl transition-all active:scale-[0.98]">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
                        </Button>
                    </form>

                    <div className="relative text-center text-sm pt-4 border-t border-white/5">
                        <span className="text-muted-foreground font-medium">Don&apos;t have an account? </span>
                        <Link href="/register" className="text-white hover:text-blue-400 underline font-black transition-colors">
                            Sign Up
                        </Link>
                    </div>


                </div>
            </div>
            <Footer />
        </main>
    );
}
