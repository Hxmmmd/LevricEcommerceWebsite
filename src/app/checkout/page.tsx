'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart, CartItem, CheckoutItemtype } from '@/lib/context/CartContext';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProductBySlug, createOrder, validateProducts } from '@/lib/actions/order';
import { ShoppingBag, Truck, CreditCard, ChevronRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import FullScreenLoader from '@/components/ui/FullScreenLoader';

export default function CheckoutPage() {
    const { items: cartItems, clearCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const productSlug = searchParams.get('product');

    const [checkoutItems, setCheckoutItems] = useState<CheckoutItemtype[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [staleError, setStaleError] = useState(false);

    const [isInitializing, setIsInitializing] = useState(true);

    // Form states
    const [shipping, setShipping] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Pakistan'
    });

    useEffect(() => {
        const initCheckout = async () => {
            setIsInitializing(true);
            try {
                if (productSlug) {
                    const product = await getProductBySlug(productSlug);
                    if (product) {
                        const price = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
                        setCheckoutItems([{
                            _id: product._id,
                            name: product.title,
                            image: product.images?.[0] || '/images/placeholder.jpg',
                            price: price,
                            qty: 1,
                            product: product._id
                        }]);
                        setTotalPrice(price);
                    } else {
                        setStaleError(true);
                    }
                } else if (cartItems.length > 0) {
                    const productIds = cartItems.map(item => item._id);
                    const dbProducts = await validateProducts(productIds);

                    if (dbProducts.length !== cartItems.length) {
                        setStaleError(true);
                    } else {
                        const validItems = cartItems.map(item => {
                            const dbProd = dbProducts.find((p: CartItem) => p._id === item._id);
                            const price = dbProd.discount > 0 ? dbProd.price * (1 - dbProd.discount / 100) : dbProd.price;
                            return {
                                ...item,
                                name: dbProd.title,
                                image: dbProd.images?.[0] || '/images/placeholder.jpg',
                                price: price,
                                product: item._id
                            };
                        });
                        setCheckoutItems(validItems);
                        const total = validItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
                        setTotalPrice(total);
                    }
                }
            } catch (error) {
                console.error("Checkout init error:", error);
            } finally {
                setIsInitializing(false);
            }
        };
        initCheckout();
    }, [productSlug, cartItems]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShipping({ ...shipping, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createOrder({
                orderItems: checkoutItems,
                shippingAddress: shipping,
                paymentMethod: 'Credit Card', // Static for demo
                itemsPrice: totalPrice,
                shippingPrice: 0,
                taxPrice: 0,
                totalPrice: totalPrice,
            });

            setOrderSuccess(true);
            clearCart(); // Clear the client-side state

            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: unknown) {
            if (err instanceof Error){
                alert(err.message || 'Failed to place order');
            }
        } finally {
            setLoading(false);
        }
    };

    if (isInitializing) {
        return <FullScreenLoader isLoading={true} />;
    }

    if (staleError) {
        return (
            <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <Header />
                <div className="w-full max-w-md p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md text-center space-y-6">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Stale Information Details</h2>
                    <p className="text-muted-foreground text-sm">
                        It looks like the products in your cart are no longer valid (this can happen after a database update). Please clear your cart and try again.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => {
                                clearCart();
                                router.push('/');
                            }}
                            className="w-full py-6 rounded-2xl bg-white text-black font-bold"
                        >
                            Clear Cart & Continue
                        </Button>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (orderSuccess) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

                    <div className="absolute top-1/4 right-0 w-75 h-75 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] text-center space-y-8 relative z-10"
                    >
                        <div className="relative mx-auto w-24 h-24">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"
                            />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                className="relative bg-green-500/20 border-4 border-green-500/50 rounded-full w-full h-full flex items-center justify-center"
                            >
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </motion.div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-linear-to-b from-white to-gray-400 bg-clip-text text-transparent italic">
                                ORDER PLACED!
                            </h1>
                            <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-medium">
                                Thank you for your purchase. We&apos;ve received your order and our wizards are preparing it for delivery.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Processing to Home</span>
                                </div>
                                <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Redirecting in 3 seconds</p>
                            </div>
                        </div>

                        <Button
                            onClick={() => router.push('/')}
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/5 text-sm font-bold uppercase tracking-widest"
                        >
                            Skip wait
                        </Button>
                    </motion.div>
                </div>
                <Footer />
            </main>
        );
    }

    if (checkoutItems.length === 0) {
        return (
            <main className="min-h-screen bg-background">
                <Header />
                <div className="container py-20 text-center">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-medium">Nothing to checkout.</h2>
                    <Button onClick={() => router.push('/products')} className="mt-4">Continue Shopping</Button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-foreground">
            <Header />
            <div className="container px-4 md:px-6 py-6 md:py-12 max-w-6xl mx-auto">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-8 border-b border-white/5 pb-4">
                    <span>Shop</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Cart</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white font-medium">Checkout</span>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left: Shipping & Payment */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                        <form onSubmit={handlePlaceOrder} id="checkout-form">
                            <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 space-y-8 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />

                                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                    <div className="p-2.5 md:p-3 bg-blue-600/10 rounded-xl text-blue-500">
                                        <Truck className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Shipping Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                                        <input
                                            name="fullName"
                                            required
                                            value={shipping.fullName}
                                            onChange={handleInputChange}
                                            className="w-full h-12 md:h-14 bg-black/40 border border-white/10 rounded-xl px-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 font-medium"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Street Address</label>
                                        <input
                                            name="address"
                                            required
                                            value={shipping.address}
                                            onChange={handleInputChange}
                                            className="w-full h-12 md:h-14 bg-black/40 border border-white/10 rounded-xl px-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 font-medium"
                                            placeholder="123 Luxury St, Apt 4B"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">City</label>
                                        <input
                                            name="city"
                                            required
                                            value={shipping.city}
                                            onChange={handleInputChange}
                                            className="w-full h-12 md:h-14 bg-black/40 border border-white/10 rounded-xl px-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 font-medium"
                                            placeholder="Karachi"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Postal Code</label>
                                        <input
                                            name="postalCode"
                                            required
                                            value={shipping.postalCode}
                                            onChange={handleInputChange}
                                            className="w-full h-12 md:h-14 bg-black/40 border border-white/10 rounded-xl px-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 font-medium"
                                            placeholder="74000"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-2 md:p-2.5 bg-blue-600/10 rounded-xl text-blue-500">
                                            <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Payment Method</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="relative group cursor-pointer">
                                            <input type="radio" name="payment" defaultChecked className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="border border-blue-500/50 bg-blue-500/5 p-4 rounded-2xl flex items-center justify-between group-hover:bg-blue-500/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full border-4 border-blue-500" />
                                                    <span className="font-semibold text-white">Credit Card</span>
                                                </div>
                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Fastest</span>
                                            </div>
                                        </div>
                                        <div className="relative group cursor-not-allowed opacity-50">
                                            <div className="border border-white/5 bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full border-2 border-white/10" />
                                                <span className="font-semibold text-gray-500">Cash on Delivery</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right: Summary Box */}
                    <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 mt-8 lg:mt-0">
                        <div className="bg-white text-black rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/10">
                            <h2 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                                Bag Details
                            </h2>
                            <div className="space-y-4 mb-8 max-h-62.5 md:max-h-75 overflow-y-auto pr-2 scrollbar-hide">
                                {checkoutItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 md:gap-4 items-center">
                                        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-black/5 shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs md:text-sm truncate">{item.name}</p>
                                            <p className="text-[10px] md:text-xs text-gray-500 font-medium">Qty: {item.qty} | ${item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-black/5 pt-6">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="text-green-600 font-bold uppercase tracking-tighter">Free</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-2">
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full h-14 md:h-16 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all font-bold text-base md:text-lg mt-8 flex items-center justify-center gap-3 group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                                ) : (
                                    <>
                                        Complete Purchase
                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>

                            <p className="text-[10px] text-center mt-4 text-gray-400 font-medium uppercase tracking-widest">
                                Secure Encrypted Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

