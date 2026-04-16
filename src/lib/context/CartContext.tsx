'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { syncCart, getCart } from '@/lib/actions/cart';

export type CartItem = {
    _id: string;
    title: string; // Renamed from name
    slug: string;
    image: string;
    price: number;
    qty: number;
    stock: number; // Renamed from countInStock
};
export type CheckoutItemtype = {
    _id: string,
    name: string,
    image: string,
    price: string,
    qty: number,
    product: string
}



type CartContextType = {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    itemsPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const { data: session, status } = useSession();
    const isFirstLoad = useRef(true);
    const isUpdatingFromServer = useRef(false);

    // Initial Load & Session Change
    useEffect(() => {
        const loadCart = async () => {
            if (status === 'authenticated') {
                const result = await getCart();
                if (result.success) {
                    isUpdatingFromServer.current = true;
                    setItems(result.items);
                }
            }

            // Clean up legacy localStorage one time
            if (typeof window !== 'undefined') {
                localStorage.removeItem('cart');
            }

            isFirstLoad.current = false;
        };

        if (status !== 'loading') {
            loadCart();
        }
    }, [status]);

    // Sync to DB
    useEffect(() => {
        if (isFirstLoad.current || isUpdatingFromServer.current) {
            isUpdatingFromServer.current = false;
            return;
        }

        const sync = async () => {
            if (status === 'authenticated') {
                await syncCart(items.map(item => ({ _id: item._id, qty: item.qty })));
            }
        };

        sync();
    }, [items, status]);

    const addToCart = useCallback((newItem: CartItem) => {
        setItems((prev) => {
            const exist = prev.find((x) => x._id === newItem._id);
            if (exist) {
                return prev.map((x) =>
                    x._id === newItem._id ? { ...exist, qty: newItem.qty } : x
                );
            } else {
                return [...prev, newItem];
            }
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setItems(prev => prev.filter(x => x._id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    // Memoize itemsPrice calculation
    const itemsPrice = useMemo(() => {
        return items.reduce((acc, item) => acc + item.price * item.qty, 0);
    }, [items]);

    const value = useMemo(() => ({
        items,
        addToCart,
        removeFromCart,
        clearCart,
        itemsPrice
    }), [items, addToCart, removeFromCart, clearCart, itemsPrice]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
