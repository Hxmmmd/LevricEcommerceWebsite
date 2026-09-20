import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Link from 'next/link';
import ProductFilters from '@/components/ProductFilters';

export const dynamic = 'force-dynamic';

async function getProducts(params: { q?: string, condition?: string, category?: string, minPrice?: string, maxPrice?: string, sort?: string }) {
    await dbConnect();
    const query: any = {};

    // Build query object for better index usage
    if (params.q?.trim()) {
        // Use a case-insensitive partial match so searches like "mac" find "MacBook".
        const sanitizedQuery = params.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(sanitizedQuery, 'i');
        query.$or = [
            { title: { $regex: regex } },
            { category: { $regex: regex } },
            { description: { $regex: regex } },
        ];
    }
    if (params.condition) query.condition = params.condition;
    if (params.category) query.category = params.category;

    const now = new Date();

    // Select only required fields to reduce data transfer
    const selectFields = '_id title slug images price rating numReviews condition discount discountExpiry createdAt';

    // Simplified query - use aggregation only when needed for complex price filtering
    if (params.minPrice || params.maxPrice || params.sort?.includes('price')) {
        const pipeline: any[] = [
            { $match: query },
            {
                $addFields: {
                    effectivePrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $gt: ["$discount", 0] },
                                    {
                                        $or: [
                                            { $eq: ["$discountExpiry", null] },
                                            { $not: ["$discountExpiry"] },
                                            { $gt: ["$discountExpiry", now] }
                                        ]
                                    }
                                ]
                            },
                            then: { $multiply: ["$price", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
                            else: "$price"
                        }
                    }
                }
            }
        ];

        // Price Filtering
        if (params.minPrice || params.maxPrice) {
            const min = Number(params.minPrice);
            const max = Number(params.maxPrice);
            const priceMatch: any = {};
            if (!isNaN(min)) priceMatch.$gte = min;
            if (!isNaN(max)) priceMatch.$lte = max;
            pipeline.push({ $match: { effectivePrice: priceMatch } });
        }

        // Sorting
        let sortObj: any = { rating: -1, numReviews: -1 }; // Default: Popularity
        if (params.sort === 'price_asc') sortObj = { effectivePrice: 1 };
        else if (params.sort === 'price_desc') sortObj = { effectivePrice: -1 };

        pipeline.push({ $sort: sortObj });

        const products = await Product.aggregate(pipeline);

        return products.map(p => ({
            ...p,
            _id: p._id.toString(),
            createdAt: p.createdAt?.toString(),
            updatedAt: p.updatedAt?.toString(),
            discountExpiry: p.discountExpiry?.toString(),
        }));
    } else {
        // Simple query without aggregation - much faster
        let sortObj: any = { rating: -1, numReviews: -1 };

        const products = await Product.find(query)
            .select(selectFields)
            .sort(sortObj)
            .lean();

        return products.map(p => ({
            ...p,
            _id: p._id.toString(),
            createdAt: p.createdAt?.toString(),
            updatedAt: p.updatedAt?.toString(),
            discountExpiry: p.discountExpiry?.toString(),
        }));
    }
}

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string, condition?: string, category?: string, minPrice?: string, maxPrice?: string, sort?: string }>
}) {
    const params = await searchParams;
    const products = await getProducts(params);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Header />
            <div className="pt-24 pb-12">
                <div className="container px-4 md:px-6">
                    {/* Header Section */}
                    <div className="mb-12">
                        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            Shop Products
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Discover {products.length} premium devices curated for precision and power.
                        </p>
                    </div>

                    <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-10">
                        {/* Sidebar Filters */}
                        <aside className="lg:block">
                            <ProductFilters />
                        </aside>

                        {/* Product Grid */}
                        <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {products.length > 0 ? (
                                    products.map((product: any) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 text-muted-foreground bg-white/5 rounded-3xl border border-white/5 h-fit">
                                        <div className="text-5xl mb-4">🔍</div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                                        <p>Try adjusting your filters or clearing them to see all products.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
