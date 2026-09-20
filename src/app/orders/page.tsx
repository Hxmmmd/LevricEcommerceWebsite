'use client';

import { useEffect, useState } from 'react';
import { getMyOrders, cancelOrder } from '@/lib/actions/order';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, ShoppingBag, Star, XCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';
import CancelOrderModal from '@/components/CancelOrderModal';
import { AlertCircle } from 'lucide-react';

export default function MyOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status, router]);

    const handleCancelClick = (orderId: string) => {
        setSelectedOrderId(orderId);
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = async (password: string) => {
        if (!selectedOrderId) {
            console.error('No order selected for cancellation');
            return;
        }

        setCancellingId(selectedOrderId);
        try {
            const result = await cancelOrder(selectedOrderId, password);
            if (result && result.success) {
                // Optimistic Update: Immediately update local state
                if (result.order) {
                    setOrders(prevOrders => prevOrders.map(order =>
                        order._id === result.order._id ? result.order : order
                    ));
                }

                router.refresh();
                setCancelModalOpen(false);
                // Background fetch to ensure consistency
                fetchOrders();
            } else {
                throw new Error('Cancellation failed');
            }
        } catch (error: any) {
            console.error('Cancellation error:', error);
            throw error; // Rethrow to be caught by the modal
        } finally {
            setCancellingId(null);
        }
    };

    const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Rejected');
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const getRemainingTime = (createdAt: string) => {
        const orderTime = new Date(createdAt).getTime();
        const expiryTime = orderTime + (1440 * 60 * 1000); // 24 hours
        const remaining = expiryTime - now.getTime();
        if (remaining <= 0) return null;

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remaining % (1000 * 60)) / 1000);

        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <main className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />

            <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-12">
                <header className="space-y-4 mb-12">
                    <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                        <Package className="w-4 h-4" /> Order Tracking
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter">My Orders</h1>
                    <p className="text-muted-foreground">Track your deliveries and view order history.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Total Orders</div>
                            <div className="text-3xl font-black">{orders.length}</div>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 backdrop-blur-md text-orange-500">
                            <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Pending</div>
                            <div className="text-3xl font-black">{pendingOrders.length}</div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-md text-green-500">
                            <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Delivered</div>
                            <div className="text-3xl font-black">{deliveredOrders.length}</div>
                        </div>
                    </div>
                </header>

                {orders.length === 0 ? (
                    <div className="rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-sm sm:p-20">
                        <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                        <h2 className="text-2xl font-black mb-2">No orders found</h2>
                        <p className="text-gray-500 mb-8 font-medium">You haven&apos;t placed any orders yet.</p>
                        <Link href="/products">
                            <button className="rounded-full bg-primary px-8 py-3 font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90">
                                Start Shopping
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, idx) => {
                            const remainingTime = getRemainingTime(order.createdAt);
                            const isCancelled = order.status === 'Cancelled';
                            const isRejected = order.status === 'Rejected';
                            const isDelivered = order.status === 'Delivered';
                            const canCancel = !isDelivered && !isCancelled && !isRejected && remainingTime;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={order._id}
                                    className={`group overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition-all hover:border-primary/40 ${isCancelled || isRejected ? 'opacity-60 grayscale-[0.5]' : ''}`}
                                >
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                        <div className="flex-grow space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Order ID</p>
                                                    <p className="text-sm font-bold font-mono">{order._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isCancelled || isRejected
                                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                        : isDelivered
                                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                            : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                                        }`}>
                                                        {isCancelled ? (
                                                            <><XCircle className="w-3 h-3" /> Cancelled</>
                                                        ) : isRejected ? (
                                                            <><XCircle className="w-3 h-3" /> Rejected</>
                                                        ) : isDelivered ? (
                                                            <><CheckCircle2 className="w-3 h-3" /> Delivered</>
                                                        ) : (
                                                            <><Clock className="w-3 h-3" /> {order.status}</>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                                <div className="space-y-4">
                                                    {order.items.map((item: any, i: number) => (
                                                        <div key={i} className="flex gap-4 items-center">
                                                            <div className="relative w-16 h-16 bg-white/5 rounded-xl overflow-hidden border border-white/5">
                                                                <img src={item.productId?.images?.[0] || '/images/placeholder.jpg'} alt={item.productId?.title || 'Product'} className="object-cover w-full h-full" />
                                                                <span className="absolute -top-1 -right-1 bg-blue-500 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                                                                    {item.quantity}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold leading-tight line-clamp-1">{item.productId?.title}</p>
                                                                <p className="text-xs text-gray-500 font-medium mt-0.5">${item.price.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-3 rounded-2xl border border-border bg-muted/40 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                                                        <div className="text-xs space-y-1">
                                                            <p className="text-gray-400 font-black uppercase text-[9px] tracking-widest">Shipping to</p>
                                                            <p className="font-bold">{order.shippingAddress.fullName}</p>
                                                            <p className="text-gray-500">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-3 border-t border-border flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Paid</span>
                                                        <span className="text-lg font-black text-blue-500">${order.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-px bg-white/5 hidden md:block" />

                                        <div className="md:w-48 flex flex-col justify-center gap-3">
                                            {/* Always show Track Order for non-cancelled/non-rejected orders */}
                                            {!(isCancelled || isRejected) && (
                                                <Link href={`/orders/${order._id}/track`} className="w-full">
                                                    <button className="w-full py-3 rounded-xl bg-blue-600/20 border border-blue-500/20 hover:bg-blue-600/30 text-[10px] font-black uppercase tracking-widest transition-all text-blue-500">
                                                        Track Order
                                                    </button>
                                                </Link>
                                            )}

                                            {/* Show Cancel Order only if within 27m window and not delivered/rejected */}
                                            {canCancel && (
                                                <button
                                                    onClick={() => handleCancelClick(order._id)}
                                                    disabled={cancellingId === order._id}
                                                    className="w-full py-3 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-[10px] font-black uppercase tracking-widest transition-all text-red-500 flex flex-col items-center justify-center group/cancel"
                                                >
                                                    {cancellingId === order._id ? (
                                                        <RotateCcw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span className="group-hover/cancel:scale-110 transition-transform">Cancel Order</span>
                                                            <span className="text-[8px] opacity-70 mt-1 font-mono">{remainingTime} Left</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {isCancelled && (
                                                <div className="w-full py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/50 text-[10px] font-black uppercase tracking-widest text-center">
                                                    Order Cancelled
                                                </div>
                                            )}

                                            {isRejected && (
                                                <div className="w-full py-3 rounded-xl bg-gray-500/5 border border-gray-500/10 text-gray-500/50 text-[10px] font-black uppercase tracking-widest text-center">
                                                    Order Rejected
                                                </div>
                                            )}

                                            {isDelivered && (
                                                <button
                                                    onClick={() => {
                                                        const p = order.items[0].productId;
                                                        // Construct product object for review modal
                                                        // ReviewModal expects { _id, name, image }
                                                        // We give it { _id, name: title, image: images[0] }
                                                        setSelectedProduct({
                                                            _id: p._id,
                                                            name: p.title,
                                                            image: p.images?.[0] || '/images/placeholder.jpg'
                                                        });
                                                        setReviewModalOpen(true);
                                                    }}
                                                    className="w-full py-3 rounded-xl bg-green-600/10 border border-green-500/20 hover:bg-green-600/20 text-[10px] font-black uppercase tracking-widest transition-all text-green-500"
                                                >
                                                    Review Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedProduct && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => {
                        setReviewModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    product={selectedProduct}
                />
            )}

            {selectedOrderId && (
                <CancelOrderModal
                    isOpen={cancelModalOpen}
                    onClose={() => {
                        setCancelModalOpen(false);
                        setSelectedOrderId(null);
                    }}
                    onConfirm={handleConfirmCancel}
                    orderId={selectedOrderId}
                />
            )}

            <Footer />
        </main>
    );
}
