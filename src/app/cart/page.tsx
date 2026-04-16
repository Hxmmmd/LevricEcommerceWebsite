'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Trash2, ShoppingCart, ArrowLeft, Lock, Sparkles, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import CartCheckoutButton from '@/components/CartCheckoutButton';
import CartQuantityToggle from '@/components/CartQuantityToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    const { items, removeFromCart, addToCart, itemsPrice } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const freeShippingThreshold = 500;
    const progressToFreeShipping = Math.min((itemsPrice / freeShippingThreshold) * 100, 100);

    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col">
            <Header />

            <div className="grow max-w-6xl mx-auto w-full px-6 py-6 lg:py-10 relative">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-100 h-100 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-100 h-100 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                <div className="flex flex-col gap-6">
                    <header className="relative py-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.3em] text-[8px] mb-2"
                        >
                            <ShoppingCart className="w-2.5 h-2.5" /> Digital Boutique
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl lg:text-4xl font-black tracking-tight leading-none mb-3"
                        >
                            YOUR <span className="ml-3">CART</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 max-w-xs text-[11px] font-medium leading-relaxed"
                        >
                            Review your refined selections and proceed to our secure checkout for a premium luxury experience.
                        </motion.p>
                    </header>

                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-4xl backdrop-blur-xl"
                        >
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                                <ShoppingCart className="relative h-14 w-14 text-blue-500 opacity-20" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight mb-2">Your cart is empty</h2>
                            <p className="text-gray-500 mb-8 max-w-50 text-center text-[11px] font-medium">Your sanctuary of style awaits. Explore our latest collections.</p>
                            <Link href="/products">
                                <Button className="px-7 py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-2xl flex items-center gap-2 text-[9px]">
                                    <ArrowLeft className="w-3 h-3" /> Start Shopping
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group flex flex-col md:flex-row items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md"
                                        >
                                            <div className="relative w-full md:w-20 h-28 md:h-20 bg-white/5 rounded-xl overflow-hidden shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title} // Renamed from name
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>

                                            <div className="grow space-y-1 text-center md:text-left">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                    <div>
                                                        <Link href={`/products/${item.slug}`} className="text-base font-black tracking-tight hover:text-blue-500 transition-colors uppercase">
                                                            {item.title} {/* Renamed from name */}
                                                        </Link>
                                                        <p className="text-blue-500 font-black text-[9px] tracking-widest mt-0.5 uppercase">${item.price.toFixed(2)}</p>
                                                    </div>

                                                    <div className="flex items-center justify-center md:justify-end gap-3">
                                                        <CartQuantityToggle
                                                            quantity={item.qty}
                                                            max={item.stock} // Renamed from countInStock
                                                            onChange={(newQty) => addToCart({ ...item, qty: newQty })}
                                                        />

                                                        <button
                                                            onClick={() => removeFromCart(item._id)}
                                                            className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <div className="pt-4 flex justify-center md:justify-start">
                                    <Link href="/products" className="text-[8px] font-black uppercase tracking-widest text-gray-700 hover:text-white transition-colors flex items-center gap-2">
                                        <ArrowLeft className="w-2.5 h-2.5" /> Back to Collection
                                    </Link>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="sticky top-20 space-y-4"
                            >
                                <div className="bg-white/5 border border-white/10 rounded-4xl p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

                                    <h2 className="text-lg font-black tracking-tighter uppercase mb-1">Order Summary</h2>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-blue-500 mb-5 flex items-center gap-2">
                                        <Lock className="w-2.5 h-2.5" /> Secure Checkout
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest group-hover:text-gray-400 transition-colors">Subtotal</span>
                                            <span className="font-black font-mono text-sm">${itemsPrice.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between items-center group">
                                            <div className="flex flex-col text-left items-start">
                                                <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest group-hover:text-gray-400 transition-colors">Shipping</span>
                                                {itemsPrice < freeShippingThreshold && (
                                                    <span className="text-[7.5px] font-bold text-blue-500/60 uppercase">Add ${(freeShippingThreshold - itemsPrice).toFixed(0)} for free shipping</span>
                                                )}
                                            </div>
                                            <span className="font-black uppercase text-[9px] tracking-widest text-blue-500">{itemsPrice >= freeShippingThreshold ? 'FREE' : 'Next step'}</span>
                                        </div>

                                        <div className="space-y-1 pb-1 text-left">
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressToFreeShipping}%` }}
                                                    className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                                                />
                                            </div>
                                            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter flex justify-between">
                                                <span>Free Shipping Tier</span>
                                                <span>{itemsPrice >= freeShippingThreshold ? 'Achieved!' : `$${freeShippingThreshold}`}</span>
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 flex justify-between items-end mb-4">
                                            <div className="flex flex-col text-left items-start">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Estimated Total</span>
                                                <span className="text-[7px] font-medium text-gray-600 uppercase whitespace-nowrap">Tax included</span>
                                            </div>
                                            <span className="text-2xl font-black font-mono tracking-tighter">${itemsPrice.toFixed(2)}</span>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <CartCheckoutButton />
                                            <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-700">
                                                <CreditCard className="w-2.5 h-2.5" /> Secured by Stripe
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-[1.2rem] flex items-center gap-3 group">
                                    <div className="bg-blue-500/10 p-2 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest">Premium Rewards</p>
                                        <p className="text-[7.5px] text-gray-600 leading-tight">You&apos;ll earn <span className="text-white">{(itemsPrice * 10).toFixed(0)}</span> points.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
