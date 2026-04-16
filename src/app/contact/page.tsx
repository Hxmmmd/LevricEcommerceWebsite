'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Instagram, ExternalLink, Facebook } from 'lucide-react'; // Added Facebook
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

// Custom TikTok Icon SVG component for "original" look
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
    </svg>
);

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-150 h-100 bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

            <Header />
            <div className="pt-24 pb-12 relative z-10">
                <div className="container mx-auto px-4 md:px-6">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-2xl mx-auto mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-linear-to-br from-white to-gray-500 bg-clip-text text-transparent tracking-tighter">
                            Lets Connect
                        </h1>
                        <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed font-medium">
                            We Would love to hear from you. Reach out regarding sales, support, or just to say hello.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

                        {/* Instagram Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Link href="https://instagram.com/levric.store" target="_blank" className="block h-full cursor-pointer group">
                                <div className="h-full bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-white/10 rounded-2xl p-4 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-3 h-3 text-white/50" />
                                    </div>
                                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-900/20 group-hover:scale-110 transition-transform duration-300">
                                        <Instagram className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-sm font-black mb-0.5 uppercase tracking-tight bg-linear-to-br from-white to-gray-500 bg-clip-text text-transparent">Instagram</h3>
                                    <p className="text-muted-foreground text-[10px] mb-2 font-medium">Follow us for updates & DM for quick support.</p>
                                    <span className="text-pink-400 text-[9px] font-black group-hover:underline decoration-pink-400/30 underline-offset-4 tracking-wider">@LEVRIC.STORE</span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* TikTok Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Link href="https://tiktok.com/@levric.store" target="_blank" className="block h-full cursor-pointer group">
                                <div className="h-full bg-white/5 border border-white/10 hover:border-white/50 hover:bg-white/10 rounded-2xl p-4 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-3 h-3 text-white/50" />
                                    </div>
                                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-gray-900 to-black flex items-center justify-center mb-4 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300 border border-white/10">
                                        <TikTokIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-sm font-black mb-0.5 uppercase tracking-tight bg-linear-to-br from-white to-gray-500 bg-clip-text text-transparent">TikTok</h3>
                                    <p className="text-muted-foreground text-[10px] mb-2 font-medium">Watch our latest unboxings and tech reviews.</p>
                                    <span className="text-gray-400 text-[9px] font-black group-hover:underline decoration-gray-400/30 underline-offset-4 tracking-wider">@LEVRIC.STORE</span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Facebook Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        >
                            <Link href="https://facebook.com/levric.store" target="_blank" className="block h-full cursor-pointer group">
                                <div className="h-full bg-white/5 border border-white/10 hover:border-blue-600/50 hover:bg-white/10 rounded-2xl p-4 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-3 h-3 text-white/50" />
                                    </div>
                                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform duration-300">
                                        <Facebook className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-sm font-black mb-0.5 uppercase tracking-tight bg-linear-to-br from-white to-gray-500 bg-clip-text text-transparent">Facebook</h3>
                                    <p className="text-muted-foreground text-[10px] mb-2 font-medium">Join our community.</p>
                                    <span className="text-blue-400 text-[9px] font-black group-hover:underline decoration-blue-400/30 underline-offset-4 tracking-wider">@LEVRIC</span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Email Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="h-full bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 rounded-2xl p-4 transition-all duration-300 group">
                                <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform duration-300">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-sm font-black mb-0.5 uppercase tracking-tight bg-linear-to-br from-white to-gray-500 bg-clip-text text-transparent">Email Us</h3>
                                <p className="text-muted-foreground text-[10px] mb-2 font-medium">Drop us a line anytime.</p>
                                <div className="space-y-0.5">
                                    <p className="text-white text-[10px] font-black hover:text-blue-400 transition-colors">SUPPORT@LEVRIC.STORE</p>
                                    <p className="text-white text-[10px] font-black hover:text-blue-400 transition-colors">SALES@LEVRIC.STORE</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Address/Phone Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="md:col-span-2 lg:col-span-1"
                        >
                            <div className="h-full bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 rounded-2xl p-4 transition-all duration-300 group">
                                <div className="w-9 h-9 rounded-lg bg-linear-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform duration-300">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-sm font-black mb-0.5 uppercase tracking-tight bg-linear-to-br from-white to-gray-500 bg-clip-text text-transparent">Visit HQ</h3>
                                <p className="text-muted-foreground text-[10px] mb-2 font-medium">Come say hi at our office.</p>
                                <div className="space-y-2">
                                    <p className="text-white text-[10px] font-black uppercase leading-tight">
                                        123 Tech Boulevard,<br />
                                        Silicon Valley, CA 94025
                                    </p>
                                    <div className="flex items-center gap-2 pt-1 text-emerald-400 text-[10px] font-black">
                                        <Phone className="w-2.5 h-2.5" />
                                        <span>+1 (555) 123-4567</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
