import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getAccessories() {
    await dbConnect();
    const query = { category: 'Accessories' }; // Explicitly filter for Accessories

    const products = await Product.find(query).sort({ rating: -1, numReviews: -1 }).lean();
    return products.map(p => ({
        ...p,
        _id: p._id.toString(),
        createdAt: p.createdAt?.toString(),
        updatedAt: p.updatedAt?.toString(),
        discountExpiry: p.discountExpiry?.toString(),
    }));
}

export default async function AccessoriesPage() {
    const products = await getAccessories();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Header />
            <div className="pt-24 pb-12">
                <div className="container px-4 md:px-6">
                    {/* Header Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-white">Accessories</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight bg-linear-to-br from-white to-gray-500 bg-clip-text text-transparent">
                            Accessories
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Upgrade your setup with our premium collection of accessories.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {products.length > 0 ? (
                            products.map((product: any) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-muted-foreground bg-white/5 rounded-3xl border border-white/5">
                                <div className="text-5xl mb-4">🎧</div>
                                <h3 className="text-xl font-semibold text-white mb-2">No accessories found</h3>
                                <p>Check back later for new arrivals.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
