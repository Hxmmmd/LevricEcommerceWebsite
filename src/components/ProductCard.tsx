'use client';
import React, { useState, useEffect, useMemo } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';


interface Product {
    _id?: string;
    title: string; // Renamed from name
    slug: string;
    category?: string;
    images: string[]; // Renamed from image
    image?: string; // Legacy/Single image support
    price: number;
    rating: number;
    numReviews?: number;
    numSales?: number;
    stock?: number;
    condition?: 'New' | 'Used';
    discount?: number;
    discountExpiry?: string;
    description?: string;
    isNewProduct?: boolean;
}

const ProductCard = React.memo(({ product }: { product: Product }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoize expensive calculations
    const { discountedPrice, isDiscountValid, mainImage } = useMemo(() => {
        const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
        const isDiscountValid = product.discount && product.discount > 0 && (!product.discountExpiry || (mounted && new Date(product.discountExpiry) > new Date()));
        const mainImage = product.images?.[0] || '/images/placeholder.jpg';

        return { discountedPrice, isDiscountValid, mainImage };
    }, [product.discount, product.price, product.discountExpiry, product.images, mounted]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{
                default: { duration: 0.3 },
                y: { type: 'spring', stiffness: 320, damping: 24 },
                scale: { type: 'spring', stiffness: 320, damping: 24 },
            }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.985 }}
            className="interactive-lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm"
        >
            <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden rounded-lg bg-white/5">
                {/* Badges */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                    {isDiscountValid ? ( // Only show discount badge if valid
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-500 text-white">
                            -{product.discount}%
                        </span>
                    ) : null}
                </div>

                <div className="relative w-full h-full">
                    <Image
                        src={mainImage}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                    />
                </div>
            </Link>

            <div className="mt-3 space-y-1.5 flex-grow flex flex-col">
                <div className="flex items-start justify-between gap-1 w-full min-w-0">
                    <h3 className="text-sm font-semibold leading-tight text-white flex items-center gap-1 w-full overflow-hidden">
                        <span className="truncate">{product.title}</span>
                        <span className="text-[10px] text-gray-400 font-normal lowercase italic shrink-0">
                            ({product.condition || 'new'})
                        </span>
                    </h3>
                </div>

                <div className="flex items-center text-yellow-500 text-xs mb-1">
                    <Star className="h-3 w-3 fill-current mr-1" />
                    <span>{product.rating || 'New'}</span>
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        {isDiscountValid ? ( // Only show discounted price if valid
                            <>
                                <span className="text-[10px] text-gray-500 line-through">${product.price.toFixed(2)}</span>
                                <span className="text-base font-bold text-white">${discountedPrice.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-base font-bold text-white">${product.price.toFixed(2)}</span>
                        )}
                    </div>
                    <Button size="sm" variant="secondary" className="rounded-full px-4 h-8 text-xs">
                        View
                    </Button>
                </div>
            </div>
        </motion.div>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
