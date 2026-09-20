'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X, Loader2, Edit } from 'lucide-react';
import { searchProducts } from '@/lib/actions/search';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';


interface SearchProps {
    isAdmin?: boolean;
    className?: string;
}

export default function Search({ isAdmin = false, className }: SearchProps) {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounce suggestions and ignore responses from older queries.
    useEffect(() => {
        const trimmedQuery = query.trim();
        let isCurrentRequest = true;

        if (trimmedQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            setIsLoading(false);
            return;
        }

        setIsOpen(true);
        setIsLoading(true);
        const timeoutId = window.setTimeout(async () => {
            try {
                const data = await searchProducts(trimmedQuery);
                if (isCurrentRequest) setResults(data);
            } catch (error) {
                if (isCurrentRequest) {
                    setResults([]);
                    console.error('[v0] Search suggestions failed:', error);
                }
            } finally {
                if (isCurrentRequest) setIsLoading(false);
            }
        }, 300);

        return () => {
            isCurrentRequest = false;
            window.clearTimeout(timeoutId);
        };
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClear = useCallback(() => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        if (isAdmin) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('q');
            router.push(`/admin?${params.toString()}`);
        }
    }, [isAdmin, searchParams, router]);

    const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setIsOpen(false);
        if (isAdmin) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('q', query.trim());
            router.push(`/admin?${params.toString()}`);
        } else {
            router.push(`/products?q=${encodeURIComponent(query.trim())}`);
        }
    }, [query, isAdmin, searchParams, router]);

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <form onSubmit={handleSearchSubmit} className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-focus-within:text-white transition-colors">
                    <SearchIcon className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    className={cn(
                        "w-full bg-white/5 border border-white/10 py-2 pl-10 pr-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all",
                        isAdmin ? "rounded-xl" : "rounded-full"
                    )}
                    placeholder={isAdmin ? "Search name or category..." : "Search laptops..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.length >= 2) setIsOpen(true);
                    }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : query.length > 0 ? (
                        <button type="button" onClick={handleClear} className="text-gray-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    ) : null}
                </div>
            </form>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        role="listbox"
                        aria-label="Product search suggestions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-500">
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                Searching products...
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-1">
                                {results.map((product) => (
                                    <Link
                                        key={product._id}
                                        href={isAdmin ? `/admin/products/${product._id}/edit` : `/products/${product.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-white/5">
                                            <Image
                                                src={product.image || '/images/placeholder.jpg'}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white flex items-center gap-1 overflow-hidden group-hover:text-blue-400 transition-colors">
                                                <span className="truncate">{product.title}</span>
                                                {!isAdmin && (
                                                    <span className="text-[10px] text-gray-400 font-normal lowercase italic shrink-0">
                                                        ({product.condition || 'new'})
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-[10px] text-gray-500 truncate uppercase mt-0.5">{product.category}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-semibold text-gray-400">
                                                ${product.price}
                                            </span>
                                            {isAdmin && <Edit className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400" />}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No results found for "{query}"
                            </div>
                        )}
                        <div className="px-2 py-2 mt-1 border-t border-white/5 text-[10px] text-center text-gray-600">
                            {isAdmin ? "Click to edit or press Enter to filter list" : "Press Enter to search all"}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
