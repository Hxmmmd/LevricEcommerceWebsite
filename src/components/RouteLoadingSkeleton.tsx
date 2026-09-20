'use client';

import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { OrderCardSkeleton, ProductCardSkeleton } from '@/components/Skeletons';

function HeaderSkeleton() {
    return <div className="h-16 border-b border-border bg-background/90" />;
}

function PageIntroSkeleton({ wide = false }: { wide?: boolean }) {
    return (
        <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className={`h-10 animate-pulse rounded-xl bg-muted ${wide ? 'w-72' : 'w-52'}`} />
            <div className="h-4 w-full max-w-md animate-pulse rounded-full bg-muted" />
        </div>
    );
}

function ProductsSkeleton() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <HeaderSkeleton />
            <div className="container px-4 py-10 sm:px-6 md:py-14">
                <PageIntroSkeleton wide />
                <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
                    <aside className="hidden space-y-4 lg:block">
                        <div className="h-56 animate-pulse rounded-2xl border border-border bg-card p-5" />
                        <div className="h-40 animate-pulse rounded-2xl border border-border bg-card p-5" />
                    </aside>
                    <section>
                        <div className="mb-5 h-12 animate-pulse rounded-xl bg-muted lg:hidden" />
                        <div className="mb-6 flex justify-between gap-4">
                            <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
                            <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />)}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function OrdersSkeleton() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <HeaderSkeleton />
            <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
                <PageIntroSkeleton />
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />)}
                </div>
                <div className="mt-8 space-y-5">
                    {Array.from({ length: 3 }).map((_, index) => <OrderCardSkeleton key={index} />)}
                </div>
            </div>
        </main>
    );
}

function DetailSkeleton() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <HeaderSkeleton />
            <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    <div className="aspect-square animate-pulse rounded-3xl border border-border bg-card" />
                    <div className="space-y-5">
                        <PageIntroSkeleton wide />
                        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                        <div className="h-12 animate-pulse rounded-xl bg-muted" />
                        <div className="h-14 animate-pulse rounded-xl bg-muted" />
                    </div>
                </div>
            </div>
        </main>
    );
}

function DefaultSkeleton() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <HeaderSkeleton />
            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-16">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                    <PageIntroSkeleton wide />
                    <div className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
                </div>
                <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => <ProductCardSkeleton key={index} />)}
                </div>
            </div>
        </main>
    );
}

export default function RouteLoadingSkeleton() {
    const pathname = usePathname();
    const content = pathname?.startsWith('/products/') ? <DetailSkeleton /> : pathname === '/products' || pathname === '/sale' || pathname === '/accessories' ? <ProductsSkeleton /> : pathname?.startsWith('/orders') ? <OrdersSkeleton /> : <DefaultSkeleton />;

    return (
        <div aria-label="Loading page" role="status">
            {content}
            <span className="sr-only">Loading page content</span>
            <Loader2 className="fixed bottom-5 right-5 size-5 animate-spin text-blue-500" aria-hidden="true" />
        </div>
    );
}
