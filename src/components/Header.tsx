'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, User, LogOut, Package, ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

import Search from '@/components/Search';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/lib/context/CartContext';
import { useAuthModal } from '@/lib/context/AuthModalContext';

export default function Header() {
    const { items } = useCart();
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { openAuthModal } = useAuthModal();

    // 🔒 body scroll lock when drawer open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const { links, isAdmin } = useMemo(() => {
        const userLinks = [
            { href: '/', label: 'Home' },
            { href: '/products', label: 'Laptops' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
        ];

        const adminLinks = [
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/orders', label: 'Sales' },
        ];

        const isAdmin = session?.user?.isAdmin;
        const links = isAdmin ? adminLinks : userLinks;

        return { links, isAdmin };
    }, [session?.user?.isAdmin]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09090b]">
            <div className="container mx-auto px-3 sm:px-4 md:px-6">
                <div className="flex min-h-16 items-center justify-start gap-2 sm:gap-4 md:gap-8">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="md:hidden text-gray-400 hover:text-white hover:bg-white/10 -ml-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 mr-4">
                        <span className="text-xl font-bold tracking-tight text-white">LEVRIC</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'group relative text-sm font-medium transition-colors duration-200 hover:text-white',
                                    pathname === link.href ? 'text-white' : 'text-gray-400'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Search */}
                    {!isAdmin && (
                        <div className="hidden md:block flex-1 max-w-md mx-4">
                            <Search />
                        </div>
                    )}

                    {/* Icons */}
                    <div className="flex items-center ml-auto space-x-1 sm:space-x-2">
                        {status === 'authenticated' && !isAdmin && (
                            <>
                                {/* Hidden on mobile, moved to drawer */}
                                <Link href="/orders" className={cn(buttonVariants('ghost', 'icon'), 'hidden md:flex text-gray-400 hover:text-white')}>
                                    <Package className="h-5 w-5" />
                                </Link>
                                <Link href="/cart" className={cn(buttonVariants('ghost', 'icon'), 'hidden md:flex relative text-gray-400 hover:text-white')}>
                                    <ShoppingCart className="h-5 w-5" />
                                    {items.length > 0 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[9px] text-white flex items-center justify-center">
                                            {items.length}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {status === 'authenticated' ? (
                            <>
                                <Link href="/profile" className={cn(buttonVariants('ghost', 'icon'), 'text-gray-400 hover:text-white')}>
                                    <User className="h-5 w-5" />
                                </Link>
                                {/* Hidden on mobile, moved to drawer bottom */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="hidden md:flex text-gray-400 hover:text-red-500"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="ghost"
                                onClick={() => openAuthModal('selection')}
                                className="text-gray-400 hover:text-white px-2 sm:px-4"
                            >
                                <User className="h-5 w-5 sm:mr-2" />
                                <span className="text-sm font-semibold">Login</span>
                            </Button>
                        )}

                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className={cn("text-gray-400 hover:text-white transition-colors", isSearchOpen && "text-blue-500")}
                            >
                                <SearchIcon className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button>
                        </div>

                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(true)}
                                className="text-gray-400 hover:text-white"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search - Toggleable */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-white/5 bg-[#09090b] overflow-visible"
                    >
                        <div className="px-3 py-3 sm:px-4">
                            <Search isAdmin={isAdmin} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[55]"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-screen min-h-screen w-[85%] max-w-sm bg-[#09090b] z-[100] border-r border-white/10 shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <span className="text-xl font-bold text-white">Menu</span>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            'block rounded-lg px-4 py-3 text-base font-medium transition duration-200 active:scale-[0.98]',
                                            pathname === link.href
                                                ? 'bg-white/10 text-white'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                {/* User Specific Mobile Links */}
                                {status === 'authenticated' && !isAdmin && (
                                    <>
                                        <div className="my-2 border-t border-white/5"></div>
                                        <Link
                                            href="/orders"
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition',
                                                pathname === '/orders' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            )}
                                        >
                                            <Package className="h-5 w-5" /> Orders
                                        </Link>
                                        <Link
                                            href="/cart"
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                'flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition',
                                                pathname === '/cart' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ShoppingCart className="h-5 w-5" /> Cart
                                            </div>
                                            {items.length > 0 && (
                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {items.length}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}
                            </div>

                            {status === 'authenticated' && (
                                <div className="border-t border-white/5 p-4 pb-12 sm:pb-8">
                                    <p className="text-sm text-white font-semibold truncate">{session?.user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                                    <Button
                                        variant="ghost"
                                        className="w-full mt-3 justify-start text-red-500 hover:bg-red-500/10"
                                        onClick={() => {
                                            setIsOpen(false);
                                            signOut({ callbackUrl: '/' });
                                        }}
                                    >
                                        <LogOut className="h-5 w-5 mr-2" /> Logout
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}

