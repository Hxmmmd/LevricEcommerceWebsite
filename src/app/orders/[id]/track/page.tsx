'use client';

import { useEffect, useState } from 'react';
import { getOrderById } from '@/lib/actions/order';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Truck, CheckCircle2, Clock, MapPin, ChevronLeft, Box, ShieldCheck, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderTrackingPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const data = await getOrderById(id as string);
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-black">Order not found</h1>
                    <Link href="/orders" className="text-blue-500 hover:underline">Back to Orders</Link>
                </div>
            </div>
        );
    }

    const trackingStates = [
        { status: 'Processing', label: 'Processing', icon: Clock, color: 'text-gray-400' },
        { status: 'Packing', label: 'Packing', icon: Box, color: 'text-orange-500' },
        { status: 'Shipped', label: 'Shipped', icon: Package, iconColor: 'text-blue-500' },
        { status: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, iconColor: 'text-purple-500' },
        { status: 'Delivered', label: 'Delivered', icon: CheckCircle2, iconColor: 'text-green-500' }
    ];

    const currentStatusIndex = trackingStates.findIndex(s => s.status === (order.status || 'Processing'));

    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col">
            <Header />

            <div className="grow max-w-4xl mx-auto w-full px-6 py-12">
                <Link href="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-8 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to My Orders</span>
                </Link>

                <div className="space-y-8">
                    {/* Header */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">
                                    <Timer className="w-4 h-4" /> Live Tracking
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter">Order #{order._id.slice(-8).toUpperCase()}</h1>
                                <p className="text-gray-400 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Status</p>
                                <div className="text-xl font-black text-blue-400 uppercase tracking-tight">{order.status || 'Processing'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Progress Map */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md">
                        <div className="relative">
                            {/* Line Background */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 hidden md:block" />

                            {/* Active Line Progress */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStatusIndex / (trackingStates.length - 1)) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 hidden md:block"
                            />

                            <div className="relative flex flex-col md:flex-row justify-between gap-12 md:gap-4">
                                {trackingStates.map((state, idx) => {
                                    const Icon = state.icon;
                                    const isCompleted = idx <= currentStatusIndex;
                                    const isCurrent = idx === currentStatusIndex;

                                    return (
                                        <div key={state.status} className="flex md:flex-col items-center gap-4 md:gap-6 flex-1 relative">
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    scale: isCurrent ? 1.2 : 1,
                                                    backgroundColor: isCompleted ? '#2563eb' : '#18181b',
                                                    borderColor: isCompleted ? '#3b82f6' : '#27272a'
                                                }}
                                                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center relative z-20 transition-all ${isCompleted ? 'shadow-[0_0_20px_rgba(37,99,235,0.3)]' : ''}`}
                                            >
                                                <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-600'}`} />

                                                {/* Vertical line for mobile */}
                                                {idx < trackingStates.length - 1 && (
                                                    <div className="absolute top-12 left-1/2 w-0.5 h-12 bg-white/5 -translate-x-1/2 md:hidden" />
                                                )}
                                            </motion.div>

                                            <div className="text-left md:text-center">
                                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCompleted ? 'text-blue-500' : 'text-gray-600'}`}>
                                                    Step {idx + 1}
                                                </p>
                                                <h3 className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                                    {state.label}
                                                </h3>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-500" /> Tracking Updates
                            </h2>
                            <div className="space-y-4">
                                {order.trackingHistory && order.trackingHistory.length > 0 ? (
                                    order.trackingHistory.slice().reverse().map((entry: any, idx: number) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={idx}
                                            className="bg-white/5 border border-white/10 rounded-3xl p-6 flex gap-6 items-start hover:border-white/20 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black uppercase tracking-widest text-blue-400">{entry.status}</span>
                                                    <span className="text-[10px] font-mono text-gray-500">
                                                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold leading-relaxed text-gray-200">
                                                    {entry.message}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-gray-500">
                                        <p className="font-bold">Waiting for shipment updates...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-blue-500" /> Details
                            </h2>
                            <div className="bg-white/5 border border-white/10 rounded-4xl p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Delivery Address</p>
                                            <p className="text-xs font-bold leading-relaxed">
                                                {order.shippingAddress.fullName}<br />
                                                {order.shippingAddress.address}<br />
                                                {order.shippingAddress.city}, {order.shippingAddress.country}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 pt-2 border-t border-white/5">
                                        <Clock className="w-4 h-4 text-gray-500 mt-1" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Timestamps</p>
                                            <div className="space-y-1 mt-1">
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-[10px] text-gray-500">Ordered:</span>
                                                    <span className="text-[10px] font-bold text-white">
                                                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {order.deliveredAt && (
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-[10px] text-gray-500">Delivered:</span>
                                                        <span className="text-[10px] font-bold text-green-400">
                                                            {new Date(order.deliveredAt).toLocaleDateString()} {new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <div className="flex justify-between items-center bg-black/40 rounded-2xl p-4">
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Value</span>
                                        <span className="text-xl font-black text-blue-500">${order.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                Download Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
