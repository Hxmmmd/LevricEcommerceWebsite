import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Force dynamic to ensure we fetch latest data if using ISR/etc, or cache it. Default is good.
export const dynamic = 'force-dynamic';

async function getHomeProducts() {
    await dbConnect();

    // Fetch only required fields to reduce data transfer
    const selectFields = '_id title slug images price rating numReviews condition discount discountExpiry createdAt';

    // Fetch 4 Newest
    const newArrivals = await Product.find({ condition: 'New' })
        .select(selectFields)
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

    // Fetch 4 Best Used Deals
    const usedDeals = await Product.find({ condition: 'Used' })
        .select(selectFields)
        .limit(4)
        .lean();

    return {
        newArrivals: newArrivals.map(serializeProduct),
        usedDeals: usedDeals.map(serializeProduct)
    };
}

function serializeProduct(p: any) {
    return {
        ...p,
        _id: p._id.toString(),
        createdAt: p.createdAt?.toString(),
        updatedAt: p.updatedAt?.toString(),
    };
}

export default async function Home() {
    // Check if user is admin and redirect to admin dashboard
    const session = await auth();

    if (session?.user?.isAdmin) {
        redirect('/admin');
    }

    const { newArrivals, usedDeals } = await getHomeProducts();

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
            <Header />
            <HeroSection />

            {/* New Arrivals Section */}
            <section className="container border-b border-white/5 px-4 py-14 sm:py-16 md:px-6 md:py-20">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">New Arrivals</h2>
                        <p className="text-muted-foreground mt-2">Experience the latest in performance technology.</p>
                    </div>
                    <Link href="/products?condition=New">
                        <Button variant="link" className="text-lg text-blue-400">View All New &rarr;</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {newArrivals.length > 0 ? (
                        newArrivals.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground bg-white/5 rounded-xl">
                            No new products found. Run the seed script!
                        </div>
                    )}
                </div>
            </section>

            {/* Used Deals Section */}
            <section className="container px-4 md:px-6 py-20">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Premium Pre-Owned</h2>
                        <p className="text-muted-foreground mt-2">Quality tested devices at unbeatable prices.</p>
                    </div>
                    <Link href="/products?condition=Used">
                        <Button variant="link" className="text-lg text-orange-400">View All Used &rarr;</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {usedDeals.length > 0 ? (
                        usedDeals.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground bg-white/5 rounded-xl">
                            No used products found. Run the seed script!
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
