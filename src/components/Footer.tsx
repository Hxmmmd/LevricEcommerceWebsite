import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background py-16">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">levric</h3>
                        <p className="text-sm text-muted-foreground">
                            Premium computing for the modern professional.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Shop</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/products" className="hover:text-foreground">Products</Link></li>
                            <li><Link href="/accessories" className="hover:text-foreground">Accessories</Link></li>
                            <li><Link href="/sale" className="hover:text-foreground">On Sale</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                            <li><Link href="/shipping" className="hover:text-foreground">Shipping Policy</Link></li>
                            <li><Link href="/returns" className="hover:text-foreground">Returns & Exchanges</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground" suppressHydrationWarning>
                    © {new Date().getFullYear()} LuxeLaptops. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
