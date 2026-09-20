import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getOrders, updateOrderStatus, rejectOrder, updateTrackingStatus } from '@/lib/actions/admin';
import { ChevronLeft, Package, CheckCircle, Clock, Truck, User, XCircle, MapPin, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import AdminOrderActions from '@/components/AdminOrderActions';

export default async function AdminOrdersPage() {
    try {
        const orders = await getOrders();

        const trackingStates = ['Processing', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered'];

        return (
            <div className="min-h-screen space-y-6 bg-background p-4 sm:space-y-8 sm:p-6 lg:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div className="space-y-1">
                        <Link href="/admin" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-2">
                            <ChevronLeft className="w-3 h-3" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tighter">Orders Management</h1>
                        <p className="text-gray-500 text-sm">Track and manage your website sales and shipments</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {orders.length === 0 ? (
                        <div className="text-center py-40 bg-card border border-border rounded-2xl shadow-sm">
                            <Package className="w-16 h-16 mx-auto mb-4 opacity-10 text-white" />
                            <h2 className="text-xl font-medium text-gray-400">No orders found yet.</h2>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {orders.map((order: any) => (
                                <div key={order._id} className={`bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:border-blue-300 transition-all group ${(order.isCancelled || order.isRejected) ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    <div className="grid items-start gap-6 p-4 sm:p-6 md:grid-cols-12 md:items-center md:p-8">
                                        {/* Order Info */}
                                        <div className="md:col-span-3 space-y-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Order ID</span>
                                                <p className="text-xs font-mono text-gray-400 truncate">#{order._id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-white">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span className="font-bold text-sm">{order.userId?.name || 'Guest'}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 pl-6">{order.userId?.email}</p>
                                            </div>
                                            <div className="flex items-start gap-2 text-gray-500">
                                                <MapPin className="w-3.5 h-3.5 mt-0.5" />
                                                <p className="text-[10px] uppercase font-bold tracking-wider">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                                            </div>
                                        </div>

                                        {/* Items Preview */}
                                        <div className="md:col-span-2">
                                            <div className="flex -space-x-3 overflow-hidden">
                                                {order.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="relative w-10 h-10 rounded-xl border-2 border-[#09090b] bg-gray-900 overflow-hidden shadow-xl" title={item.productId?.title}>
                                                        <Image src={item.productId?.images?.[0] || '/images/placeholder.jpg'} alt={item.productId?.title || 'Product'} fill className="object-cover" />
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[#09090b] bg-gray-800 text-[10px] font-bold text-white z-10">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2 font-black uppercase tracking-widest">
                                                {order.items.length} item{order.items.length > 1 ? 's' : ''} • <span className="text-white">${order.totalAmount.toFixed(2)}</span>
                                            </p>
                                        </div>

                                        {/* Actions & Status */}
                                        <div className="md:col-span-4 space-y-3">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {/* Status Badge */}
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    order.status === 'Cancelled' || order.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    {order.status === 'Processing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                                                        order.status === 'Delivered' ? <CheckCircle className="w-3.5 h-3.5" /> :
                                                            order.status === 'Cancelled' || order.status === 'Rejected' ? <XCircle className="w-3.5 h-3.5" /> :
                                                                <Truck className="w-3.5 h-3.5" />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                                                </div>
                                            </div>

                                            <AdminOrderActions
                                                orderId={order._id}
                                                status={order.status}
                                            />

                                            {(order.status === 'Cancelled' || order.status === 'Rejected') && (
                                                <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                    <p className="text-xs text-red-400">
                                                        This order was {order.status.toLowerCase()}. Stock has been restored.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error loading admin orders:', error);
        return (
            <div className="p-8 text-center">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl inline-block mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Failed to load orders</h3>
                <p className="text-gray-400">Please try refreshing the page</p>
            </div>
        );
    }
}
