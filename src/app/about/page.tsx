'use client';

import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background">
            <Header />
            <div className="pt-24 pb-12">
                <div className="container mx-auto px-4 md:px-6">

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Redefining Portable Power
                        </h1>
                        <p className="text-muted-foreground text-lg mb-8">
                            At levric, we believe technology should be an extension of your creativity.
                            We craft machines that are not just tools, but masterpieces of engineering and design.
                        </p>
                    </motion.div>

                    {/* Mission Section */}
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6 order-2 md:order-1"
                        >
                            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                            <p className="text-muted-foreground">
                                Founded in 2024, our mission is simple: to bridge the gap between extreme performance and elegant aesthetics.
                                We got tired of choosing between a powerful bulky laptop and a sleek but slow one.
                            </p>
                            <p className="text-muted-foreground">
                                Every levric is built with premium materials, calibrated displays, and the latest generation processors
                                to ensure you never have to compromise.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative h-75 md:h-100 w-full bg-linear-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-white/10 overflow-hidden order-1 md:order-2"
                        >
                            <Image
                                src="/images/2.png"
                                alt="Our Mission"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </div>

                    {/* Values Section */}
                    <div className="mb-24">
                        <h2 className="text-3xl font-bold text-center text-white mb-12">Why Choose Us</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: 'Performance', desc: 'Top-tier silicon for demanding workflows.' },
                                { title: 'Design', desc: 'Minimalist aesthetics that look good anywhere.' },
                                { title: 'Support', desc: '24/7 concierge support for all our pro users.' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                                >
                                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Ready to upgrade?</h2>
                        <Link href="/products" className={cn(buttonVariants('default', 'lg'), "rounded-full px-8")}>
                            Explore Laptops
                        </Link>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
