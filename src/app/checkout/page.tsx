'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart, CartItem, CheckoutItemtype } from '@/lib/context/CartContext';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProductBySlug, createOrder, validateProducts, getCheckoutSettings } from '@/lib/actions/order';
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
    const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Cash on Delivery'>('Credit Card');
    const [deliveryFee, setDeliveryFee] = useState(10);

    const [isInitializing, setIsInitializing] = useState(true);

    // Form states
    const [shipping, setShipping] = useState({
        phone: '',
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        apartment: '',
        city: '',
        postalCode: '',
        alternatePhone: '',
        country: 'Pakistan'
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        getCheckoutSettings().then((settings) => setDeliveryFee(settings.cashOnDeliveryFee)).catch(() => undefined);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShipping({ ...shipping, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        const errors: Record<string, string> = {};
        const phonePattern = /^03\d{9}$/;
        if (!phonePattern.test(shipping.phone)) errors.phone = 'Enter a valid 11-digit Pakistani mobile number.';
        if (!shipping.firstName.trim()) errors.firstName = 'First name is required.';
        if (!shipping.lastName.trim()) errors.lastName = 'Last name is required.';
        if (shipping.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) errors.email = 'Enter a valid email address.';
        if (!shipping.address.trim()) errors.address = 'Address is required.';
        if (!shipping.city.trim()) errors.city = 'Select or enter a city.';
        if (shipping.alternatePhone && !phonePattern.test(shipping.alternatePhone)) errors.alternatePhone = 'Enter a valid 11-digit mobile number.';
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setLoading(true);

        try {
            await createOrder({
                orderItems: checkoutItems,
                shippingAddress: {
                    ...shipping,
                    fullName: `${shipping.firstName.trim()} ${shipping.lastName.trim()}`
                },
                paymentMethod,
                itemsPrice: totalPrice,
                shippingPrice: paymentMethod === 'Cash on Delivery' ? deliveryFee : 0,
                taxPrice: 0,
                totalPrice: totalPrice + (paymentMethod === 'Cash on Delivery' ? deliveryFee : 0),
            });

            setOrderSuccess(true);
            clearCart(); // Clear the client-side state

            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
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
        <main className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
            <Header />
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
                {/* Breadcrumbs */}
                <div className="mb-8 flex items-center gap-2 border-b border-border pb-4 text-xs text-muted-foreground sm:mb-10">
                    <span>Shop</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Cart</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white font-medium">Checkout</span>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
                    {/* Left: Shipping & Payment */}
                    <div className="space-y-6 lg:col-span-7 xl:col-span-8">
                        <form onSubmit={handlePlaceOrder} id="checkout-form">
                            <div className="relative space-y-8 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:p-8">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />

                                <div className="flex items-center gap-4 border-b border-border pb-6">
                                    <div className="p-2.5 md:p-3 bg-blue-600/10 rounded-xl text-blue-500">
                                        <Truck className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Shipping Information</h2>
                                </div>

                                <div className="space-y-8">
                                    <section className="space-y-5">
                                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Contact details</p><h3 className="mt-1 text-lg font-bold">Who should we deliver to?</h3></div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone number <span className="text-destructive">*</span></label>
                                            <div className="flex rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring/40">
                                                <span className="flex items-center gap-2 border-r border-input px-4 text-sm font-medium text-muted-foreground"><span className="flex size-6 items-center justify-center rounded-full bg-green-700 text-[10px] text-white">PK</span>+92</span>
                                                <input name="phone" inputMode="numeric" value={shipping.phone} onChange={handleInputChange} placeholder="03001234567" className="h-14 min-w-0 flex-1 bg-transparent px-4 text-base text-foreground outline-none placeholder:text-muted-foreground" />
                                            </div>
                                            {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {(['firstName', 'lastName'] as const).map((field) => <div key={field} className="space-y-2"><label className="text-sm font-medium">{field === 'firstName' ? 'First name' : 'Last name'} <span className="text-destructive">*</span></label><input name={field} value={shipping[field]} onChange={handleInputChange} placeholder={field === 'firstName' ? 'First name' : 'Last name'} className="h-14 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40" />{formErrors[field] && <p className="text-xs text-destructive">{formErrors[field]}</p>}</div>)}
                                        </div>
                                        <div className="space-y-2"><label className="text-sm font-medium">Email address <span className="text-muted-foreground">(optional)</span></label><input name="email" type="email" value={shipping.email} onChange={handleInputChange} placeholder="name@example.com" className="h-14 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40" />{formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}</div>
                                    </section>
                                    <section className="space-y-5 border-t border-border pt-7">
                                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Shipping address</p><h3 className="mt-1 text-lg font-bold">Where should we deliver?</h3></div>
                                        <div className="space-y-2"><label className="text-sm font-medium">Address <span className="text-destructive">*</span></label><input name="address" value={shipping.address} onChange={handleInputChange} placeholder="House number, street number, area" className="h-14 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40" />{formErrors.address && <p className="text-xs text-destructive">{formErrors.address}</p>}</div>
                                        <div className="space-y-2"><label className="text-sm font-medium">Apt, suite, unit, building <span className="text-muted-foreground">(optional)</span></label><input name="apartment" value={shipping.apartment} onChange={handleInputChange} placeholder="Apartment, suite, unit, building" className="h-14 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40" /></div>
                                        <div className="grid gap-5 sm:grid-cols-[1.2fr_.8fr]"><div className="space-y-2"><label className="text-sm font-medium">City <span className="text-destructive">*</span></label><select name="city" value={shipping.city} onChange={handleInputChange} className="h-14 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none focus:ring-2 focus:ring-ring/40"><option value="">Select city</option>{['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Quetta'].map((city) => <option key={city} value={city}>{city}</option>)}</select>{formErrors.city && <p className="text-xs text-destructive">{formErrors.city}</p>}</div><div className="space-y-2"><label className="text-sm font-medium">Zip <span className="text-muted-foreground">(optional)</span></label><input name="postalCode" inputMode="numeric" value={shipping.postalCode} onChange={handleInputChange} placeholder="Enter zip" className="h-14 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40" /></div></div>
                                        <div className="space-y-2"><label className="text-sm font-medium">Alternate phone for delivery <span className="text-muted-foreground">(optional)</span></label><input name="alternatePhone" inputMode="numeric" value={shipping.alternatePhone} onChange={handleInputChange} placeholder="03001234567" className="h-14 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40" />{formErrors.alternatePhone && <p className="text-xs text-destructive">{formErrors.alternatePhone}</p>}</div>
                                    </section>
                                    {submitError && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</div>}
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-2 md:p-2.5 bg-blue-600/10 rounded-xl text-blue-500">
                                            <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Payment Method</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="relative group cursor-pointer">
                                            <input type="radio" name="payment" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={() => setPaymentMethod('Credit Card')} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                                            <div className="flex items-center justify-between rounded-2xl border border-primary/50 bg-primary/5 p-4 transition-colors group-hover:bg-primary/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full border-4 border-blue-500" />
                                                    <span className="font-semibold text-foreground">Credit Card</span>
                                                </div>
                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Fastest</span>
                                            </div>
                                        </div>
                                        <div className={`relative group cursor-pointer ${paymentMethod === 'Cash on Delivery' ? 'ring-2 ring-primary/30' : ''}`}>
                                            <input type="radio" name="payment" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 p-4 transition-colors group-hover:bg-accent/60">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-4 w-4 rounded-full border-4 ${paymentMethod === 'Cash on Delivery' ? 'border-primary' : 'border-muted-foreground/30'}`} />
                                                    <span className="font-semibold text-foreground">Cash on Delivery</span>
                                                </div>
                                                <span className="text-right text-[10px] font-bold uppercase tracking-wide text-amber-500">+${deliveryFee.toFixed(2)} fee</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right: Summary Box */}
                    <div className="mt-6 lg:col-span-5 lg:mt-0 xl:col-span-4 lg:sticky lg:top-24">
                        <div className="rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-xl shadow-primary/5 sm:p-7">
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
                                            <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Qty: {item.qty} | ${item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-border pt-6">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className={paymentMethod === 'Cash on Delivery' ? 'font-bold uppercase tracking-tighter text-amber-500' : 'font-bold uppercase tracking-tighter text-green-600'}>{paymentMethod === 'Cash on Delivery' ? `$${deliveryFee.toFixed(2)}` : 'Free'}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-2">
                                    <span>Total</span>
                                    <span>${(totalPrice + (paymentMethod === 'Cash on Delivery' ? deliveryFee : 0)).toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                form="checkout-form"
                                className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 group sm:h-16 sm:text-lg"
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

