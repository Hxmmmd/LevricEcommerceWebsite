'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
    return (
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background pt-2 pb-6">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />

            <div className="container relative z-10 grid items-center gap-8 px-4 py-8 sm:gap-12 sm:px-6 md:py-12 lg:grid-cols-2">
                {/* Text Content - Reordered for mobile */}
                <div className="space-y-6 text-center lg:text-left order-1 lg:order-1">
                    {/* Heading - Shows first on mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-slate-400 leading-[1.1]">
                            Future of <br className="hidden lg:block" /> Computing
                        </h1>
                    </motion.div>

                    {/* Image - Shows second on mobile, hidden on desktop (shown in right column) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative h-[250px] sm:h-[300px] w-full lg:hidden"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full max-w-[600px] mx-auto">
                                <Image
                                    src="/images/1.png"
                                    alt="Premium levric Laptop"
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    priority
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Description - Shows third on mobile */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-[600px] mx-auto lg:mx-0"
                    >
                        Discover the most powerful and elegant laptops designed for professionals, creatives, and gamers.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
                    >
                        <Link href="/products" className="w-full sm:w-auto">
                            <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                                Shop Now
                            </Button>
                        </Link>
                        <Link href="/about" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto hover:bg-accent transition-colors">
                                Learn More
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Image - Shows on desktop only (right column) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative h-[600px] w-full hidden lg:block order-2"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full max-w-[800px] mx-auto">
                            <Image
                                src="/images/1.png"
                                alt="Premium levric Laptop"
                                fill
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
