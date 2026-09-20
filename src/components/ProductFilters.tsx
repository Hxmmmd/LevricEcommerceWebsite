'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Sliders, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterControlsProps {
    minPrice: string;
    setMinPrice: (val: string) => void;
    maxPrice: string;
    setMaxPrice: (val: string) => void;
    condition: string;
    setCondition: (val: string) => void;
    sort: string;
    setSort: (val: string) => void;
    conditions: string[];
    handleApplyFilters: () => void;
    handleClear: () => void;
}

const FilterControls = ({
    minPrice, setMinPrice, maxPrice, setMaxPrice,
    condition, setCondition,
    sort, setSort,
    conditions, handleApplyFilters, handleClear
}: FilterControlsProps) => (
    <div className="space-y-5">
        {/* Sort By */}
        <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort By</h3>
            <div className="grid grid-cols-1 gap-1.5">
                {[
                    { label: 'Popularity (Default)', value: '' },
                    { label: 'Price: Low to High', value: 'price_asc' },
                    { label: 'Price: High to Low', value: 'price_desc' },
                ].map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={`text-left px-4 py-2 rounded-xl text-[11px] font-medium transition-all border ${sort === opt.value
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                            : 'bg-muted/60 border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Range</h3>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="Min"
                        className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="Max"
                        className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>
        </div>


        {/* Condition */}
        <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</h3>
            <div className="grid grid-cols-2 gap-1.5">
                {conditions.map((cond) => (
                    <button
                        key={cond}
                        onClick={() => setCondition(condition === cond ? '' : cond)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${condition === cond
                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-sm'
                            : 'bg-muted/60 border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                    >
                        {cond}
                    </button>
                ))}
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleApplyFilters} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 text-sm h-8 rounded-lg">
                Apply Filters
            </Button>
            <button
                onClick={handleClear}
                className="text-[10px] text-gray-500 hover:text-white transition-colors py-1"
            >
                Clear All
            </button>
        </div>
    </div>
);

export default function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [condition, setCondition] = useState(searchParams.get('condition') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || '');
    const [isOpen, setIsOpen] = useState(false); // Mobile toggle state

    // Sync state with URL params
    useEffect(() => {
        const min = searchParams.get('minPrice');
        const max = searchParams.get('maxPrice');
        setMinPrice(min !== null ? min : '');
        setMaxPrice(max !== null ? max : '');
        setCondition(searchParams.get('condition') || '');
        setSort(searchParams.get('sort') || '');
    }, [searchParams]);

    const conditions = ['New', 'Used'];

    const handleApplyFilters = (overrideSort?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/products';

        if (minPrice && !isNaN(Number(minPrice))) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice && !isNaN(Number(maxPrice))) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        if (condition) params.set('condition', condition);
        else params.delete('condition');

        const activeSort = overrideSort !== undefined ? overrideSort : sort;
        if (activeSort) params.set('sort', activeSort);
        else params.delete('sort');

        router.push(`${currentPath}?${params.toString()}`);
        setIsOpen(false);
    };

    const handleSortChange = (newSort: string) => {
        setSort(newSort);
        handleApplyFilters(newSort);
    };

    const handleClear = () => {
        setMinPrice('');
        setMaxPrice('');
        setCondition('');
        setSort('');
        const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') ? '/admin' : '/products';
        router.push(basePath);
        setIsOpen(false);
    };

    const commonProps = {
        minPrice, setMinPrice, maxPrice, setMaxPrice,
        condition, setCondition,
        sort, setSort: handleSortChange,
        conditions, handleApplyFilters: () => handleApplyFilters(), handleClear
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-3 text-foreground font-medium text-sm shadow-sm transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-400" />
                        <span>Filter Products</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Main Filters Container */}
            <div className={`hidden lg:block bg-card border border-border rounded-2xl p-4 h-fit sticky top-24 shadow-sm`}>
                <div className="flex items-center gap-2 text-foreground font-bold text-sm border-b border-border pb-3 mb-4">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Filters
                </div>
                <FilterControls {...commonProps} />
            </div>

            {/* Mobile Filter Overlay & Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '-100%', opacity: 1 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 1 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ backgroundColor: '#09090b', opacity: 1 }}
                            className="lg:hidden fixed inset-y-0 left-0 z-[100] w-[85%] md:w-[40%] border-r border-white/10 p-5 shadow-2xl flex flex-col pt-20"
                        >
                            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
                                <span className="text-white font-bold text-sm flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-blue-400" />
                                    Filters
                                </span>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                                <FilterControls {...commonProps} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
