'use client';

import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/context/CartContext";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/lib/context/AuthModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Check } from "lucide-react";

export default function AddToCartButton({ product }: { product: any }) {
    const { addToCart, removeFromCart, items } = useCart();

    const { data: session } = useSession();
    const { openAuthModal } = useAuthModal();

    // Use slug or _id for comparison - ensuring consistency
    const existItem = items.find((x) => x._id === product._id || (product.slug && x.slug === product.slug));
    const isInCart = !!existItem;

    const handleToggleCart = () => {
        if (!session) {
            openAuthModal();
            return;
        }

        if (isInCart) {
            removeFromCart(existItem._id);
        } else {
            if (product.stock < 1) {
                alert('Sorry. Product is out of stock');
                return;
            }
            void fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'add_to_cart', productId: product._id, path: window.location.pathname }) }).catch(() => undefined);
            addToCart({
                _id: product._id,
                title: product.title, // Renamed from name
                slug: product.slug,
                image: product.images?.[0] || product.image || '/images/placeholder.jpg',
                price: product.price,
                qty: 1,
                stock: product.stock // Renamed from countInStock
            });
        }
    };

    return (
        <Button
            size="lg"
            onClick={handleToggleCart}
            variant={isInCart ? "outline" : "default"}
            className="w-full md:w-auto min-w-[200px] relative overflow-hidden group"
        >
            <AnimatePresence mode="wait">
                {isInCart ? (
                    <motion.div
                        key="remove"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center justify-center text-red-400 group-hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="mr-2 h-5 w-5" />
                        Remove from Bag
                    </motion.div>
                ) : (
                    <motion.div
                        key="add"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center justify-center"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Bag
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click Ripple effect or scale feedback happens via Button's default transition but we add a custom one */}
            <motion.div
                whileTap={{ scale: 0.95 }}
                className="absolute inset-0 pointer-events-none"
            />
        </Button>
    );
}
