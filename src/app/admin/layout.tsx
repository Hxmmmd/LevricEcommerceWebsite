import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Package, Settings } from 'lucide-react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Access Control: Redirect if not admin
    if (!session?.user || !session.user.isAdmin) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <div className="mx-auto flex w-full max-w-[1600px] flex-col lg:flex-row">
                <aside className="border-b border-border bg-card/70 lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
                    <div className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-2 lg:p-5">
                        <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground lg:block">Workspace</p>
                        <Link href="/admin" className="flex shrink-0 items-center gap-3 rounded-xl bg-primary/10 px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/15"><LayoutDashboard className="size-4 text-primary" />Dashboard</Link>
                        <Link href="/admin/orders" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><ShoppingBag className="size-4" />Sales & Orders</Link>
                        <Link href="/admin" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Package className="size-4" />Inventory</Link>
                        <Link href="/admin" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Settings className="size-4" />Settings</Link>
                    </div>
                </aside>
                <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
