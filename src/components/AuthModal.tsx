'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCsrfToken, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialMode?: 'selection' | 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'selection' }: AuthModalProps) {
    const [mode, setMode] = useState<'selection' | 'login' | 'register'>(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [readOnly, setReadOnly] = useState(true);
    const router = useRouter();

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Reset when mode changes
    useEffect(() => {
        setName('');
        setEmail('');
        setPassword('');
        setError('');
        setReadOnly(true);
    }, [mode, isOpen]);

    const validatePassword = (pass: string) => {
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        return pass.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
    };

    const handleSocialLogin = async (provider: string) => {
        setLoading(true);
        try {
            await signIn(provider, { callbackUrl: window.location.href });
        } catch (err) {
            setError(`Failed to sign in with ${provider}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const csrfToken = await getCsrfToken();
                const res = await signIn('credentials', {
                    redirect: false,
                    email: email.trim().toLowerCase(),
                    password,
                    ...(csrfToken ? { csrfToken } : {}),
                });

                if (res?.error) {
                    setError('Invalid email or password');
                } else {
                    onSuccess?.();
                    onClose();
                    router.refresh();
                }
            } else if (mode === 'register') {
                if (!validatePassword(password)) {
                    setError('Password must be 8+ chars with uppercase, lowercase, number, and special char.');
                    setLoading(false);
                    return;
                }

                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });

                if (res.ok) {
                    // Auto login after registration
                    const csrfToken = await getCsrfToken();
                    await signIn('credentials', {
                        redirect: false,
                        email: email.trim().toLowerCase(),
                        password,
                        ...(csrfToken ? { csrfToken } : {}),
                    });
                    onSuccess?.();
                    onClose();
                    router.refresh();
                } else {
                    const data = await res.json();
                    setError(data.error || 'Registration failed');
                }
            }
        } catch (err: any) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-[420px] bg-[#09090b] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-center overflow-hidden group"
                >
                    {/* Glowing background effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[100px] rounded-full group-hover:bg-blue-600/30 transition-all duration-700" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 blur-[100px] rounded-full group-hover:bg-purple-600/30 transition-all duration-700" />

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative space-y-6 z-10">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black tracking-tighter text-white">
                                {mode === 'selection' ? 'Choose Access' : mode === 'login' ? 'Welcome Back' : 'Get Started'}
                            </h2>
                            <p className="text-sm text-gray-400 font-medium">
                                {mode === 'selection' ? 'Select your preferred login method' : mode === 'login' ? 'Sign in to place your order' : 'Create an account to continue'}
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-3">
                            {mode === 'selection' ? (
                                <div className="space-y-4 pt-2">
                                    <button
                                        onClick={() => handleSocialLogin('google')}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100 py-4 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#09090b] px-3 text-gray-500 font-bold tracking-widest">Or</span></div>
                                    </div>

                                    <button
                                        onClick={() => setMode('login')}
                                        className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 py-4 rounded-xl font-bold transition-all active:scale-[0.98]"
                                    >
                                        <Mail className="w-5 h-5 text-blue-500" />
                                        Continue with Email
                                    </button>
                                </div>
                            ) : (
                                <form key={mode} onSubmit={handleSubmit} className="space-y-4 pt-2" autoComplete="off">
                                    {/* Decoy fields for browser autofill */}
                                    <input type="text" name="prevent_autofill" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
                                    <input type="password" name="password_fake" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

                                    {mode === 'register' && (
                                        <div className="space-y-1.5">
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    key="name-input"
                                                    name="user_full_name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    onFocus={() => setReadOnly(false)}
                                                    onClick={() => setReadOnly(false)}
                                                    readOnly={readOnly}
                                                    placeholder="Your Name"
                                                    required
                                                    autoComplete="off"
                                                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                key={`email-${mode}`}
                                                name={`user_email_${mode}`}
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setReadOnly(false)}
                                                onClick={() => setReadOnly(false)}
                                                readOnly={readOnly}
                                                placeholder="Email Address"
                                                required
                                                autoComplete="off"
                                                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                key={`password-${mode}`}
                                                name={`user_password_${mode}`}
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setReadOnly(false)}
                                                onClick={() => setReadOnly(false)}
                                                readOnly={readOnly}
                                                placeholder="Password"
                                                required
                                                autoComplete={mode === 'register' ? "new-password" : "current-password"}
                                                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {mode === 'register' && password && (
                                            <div className="space-y-3 mt-3 px-1">
                                                <div className="flex gap-1.5">
                                                    {[1, 2, 3, 4].map((step) => {
                                                        const criteriaMet = [
                                                            password.length >= 8,
                                                            /[A-Z]/.test(password),
                                                            /[a-z]/.test(password),
                                                            /[0-9]/.test(password),
                                                            /[!@#$%^&*(),.?":{}|<>]/.test(password)
                                                        ].filter(Boolean).length;

                                                        let isActive = false;
                                                        if (step === 1 && criteriaMet >= 1) isActive = true;
                                                        if (step === 2 && criteriaMet >= 3) isActive = true;
                                                        if (step === 3 && criteriaMet >= 4) isActive = true;
                                                        if (step === 4 && criteriaMet >= 5) isActive = true;

                                                        let colorClass = 'bg-white/10';
                                                        if (isActive) {
                                                            if (criteriaMet <= 2) colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
                                                            else if (criteriaMet === 3) colorClass = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
                                                            else if (criteriaMet === 4) colorClass = 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
                                                            else colorClass = 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
                                                        }

                                                        return (
                                                            <div
                                                                key={step}
                                                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${colorClass}`}
                                                            />
                                                        );
                                                    })}
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Security Strength</p>
                                                    {(() => {
                                                        const criteriaMet = [
                                                            password.length >= 8,
                                                            /[A-Z]/.test(password),
                                                            /[a-z]/.test(password),
                                                            /[0-9]/.test(password),
                                                            /[!@#$%^&*(),.?":{}|<>]/.test(password)
                                                        ].filter(Boolean).length;

                                                        let label = 'Weak';
                                                        let color = 'text-red-500';
                                                        if (criteriaMet >= 5) { label = 'Strong'; color = 'text-green-500'; }
                                                        else if (criteriaMet >= 4) { label = 'Good'; color = 'text-blue-500'; }
                                                        else if (criteriaMet >= 3) { label = 'Moderate'; color = 'text-yellow-500'; }
                                                        else if (criteriaMet >= 2) { label = 'Weak'; color = 'text-red-500'; }

                                                        return <span className={`text-[9px] font-black uppercase tracking-widest ${color} animate-in fade-in zoom-in-95`}>{label}</span>;
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-white text-black hover:bg-gray-200 py-6 rounded-xl font-black text-base shadow-lg shadow-white/5 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </Button>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                            className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                                        >
                                            {mode === 'login'
                                                ? "Don't have an account? Sign Up"
                                                : "Already have an account? Sign In"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode('selection')}
                                            className="text-xs text-blue-500 hover:text-blue-400 transition-colors uppercase font-black tracking-widest pt-2"
                                        >
                                            Back to other methods
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
