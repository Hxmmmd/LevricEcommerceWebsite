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
            <div className="min-h-screen w-full overflow-x-hidden bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
                <div className="mx-auto mb-8 flex w-full max-w-7xl flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <Link href="/admin" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-2">
                            <ChevronLeft className="w-3 h-3" /> Back to Dashboard
                        </Link>
                        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Sales workspace</p><h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Orders management</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Track purchases, update fulfillment, and keep customers informed.</p></div>
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
                                <div key={order._id} className={`overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:border-blue-400/50 group ${(order.isCancelled || order.isRejected) ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    <div className="grid items-start gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(180px,.55fr)_minmax(260px,.9fr)] lg:items-center lg:gap-8 lg:p-7">
                                        {/* Order Info */}
                                        <div className="min-w-0 space-y-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Order ID</span>
                                                <p className="text-xs font-mono text-gray-400 truncate">#{order._id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-white">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span className="font-bold text-sm">{order.userId?.name || 'Guest'}</span>
                                                </div>
                                                <p className="pl-6 text-xs text-muted-foreground">{order.shippingAddress.phone || order.userId?.email}</p>
                                                {order.shippingAddress.email && <p className="pl-6 text-xs text-muted-foreground">{order.shippingAddress.email}</p>}
                                            </div>
                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                <MapPin className="mt-0.5 h-3.5 w-3.5" />
                                                <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-wider">{order.shippingAddress.address}{order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}</p><p className="text-[10px] font-bold uppercase tracking-wider">{order.shippingAddress.city}{order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}, {order.shippingAddress.country}</p>{order.shippingAddress.alternatePhone && <p className="text-[10px] font-bold uppercase tracking-wider">Alt: {order.shippingAddress.alternatePhone}</p>}</div>
                                            </div>
                                        </div>

                                        {/* Items Preview */}
                                        <div className="min-w-0 rounded-2xl border border-border bg-muted/30 p-4">
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
                                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {order.items.length} item{order.items.length > 1 ? 's' : ''} • <span className="text-foreground">${order.totalAmount.toFixed(2)}</span>
                                            </p>
                                            {order.shippingPrice > 0 && <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-amber-500">COD delivery fee: ${order.shippingPrice.toFixed(2)}</p>}
                                        </div>

                                        {/* Actions & Status */}
                                        <div className="min-w-0 space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
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
