import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import { Star } from 'lucide-react';
import Image from 'next/image';
import ProductGallery from '@/components/ProductGallery';
import WhatsAppButton from '@/components/WhatsAppButton';
import BuyNowButton from '@/components/BuyNowButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Metadata, ResolvingMetadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: `${product.title} (${product.condition}) - Buy Online`,
        description: product.description?.substring(0, 160) || `Buy ${product.title} at levric. Premium ${product.category} in ${product.condition} condition.`,
        openGraph: {
            title: product.title,
            description: `Get the best deal on ${product.title}. Price: $${product.price}.`,
            url: `https://levric.vercel.app/products/${slug}`,
            images: [
                product.images?.[0] || product.image || '',
                ...previousImages,
            ],
        },
    }
}

async function getProduct(slug: string) {
    await dbConnect();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return null;
    return {
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt?.toString(),
        updatedAt: product.updatedAt?.toString(),
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />
            <div className="container px-4 md:px-6 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    {/* Product Image Gallery */}
                    <ProductGallery
                        images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
                        title={product.title}
                    />

                    {/* Product Info */}
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold flex items-baseline gap-3">
                            {product.title}
                            <span className="text-xl md:text-2xl text-gray-500 font-medium lowercase italic">
                                ({product.condition || 'new'})
                            </span>
                        </h1>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2 text-yellow-500">
                                <Star className="h-5 w-5 fill-current" />
                                <span className="text-lg font-black">{product.rating.toFixed(1)}</span>
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                            <span className="text-muted-foreground font-bold tracking-tight">{product.numReviews} Reviews</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                            <span className="text-blue-500 font-black uppercase tracking-widest text-[10px] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{product.numSales}+ Sold</span>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <p className="text-5xl font-black tracking-tighter">${product.price.toLocaleString()}</p>
                            {product.discount > 0 && (
                                <p className="text-xl text-gray-500 line-through font-bold">${(product.price / (1 - product.discount / 100)).toFixed(0)}</p>
                            )}
                        </div>

                        <div>
                            {product.stock > 0 ? (
                                <div className="flex items-center space-x-2 text-green-500 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-current" />
                                    <span className="font-bold">In Stock ({product.stock} units)</span>
                                </div>
                            ) : (
                                <div className="text-red-500 mb-4 font-bold flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-current" />
                                    <span>Out of Stock</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <AddToCartButton product={product} />
                                <BuyNowButton product={product} />
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-white/5"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground font-black tracking-[0.3em]">Or</span>
                                    </div>
                                </div>
                                <WhatsAppButton productName={product.title} />
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none pt-4 border-t border-white/5">
                            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Description</h3>
                            <div className="text-muted-foreground leading-relaxed font-medium">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {product.description || ''}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-24 pt-12 border-t border-white/5">
                    <header className="mb-12">
                        <h2 className="text-3xl font-black tracking-tighter mb-2">Customer Reviews</h2>
                        <p className="text-gray-500 font-medium">Verified feedback from our community.</p>
                    </header>

                    {product.reviews && product.reviews.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {product.reviews.map((review: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-black text-lg">{review.user}</p>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{new Date(review.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-400 font-medium leading-relaxed">{review.comment}</p>
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 pt-2">
                                            {review.images.map((img: string, j: number) => (
                                                <img key={j} src={img} alt="User review" className="w-20 h-20 rounded-xl object-cover border border-white/5" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 text-center">
                            <p className="text-gray-500 font-bold italic">No reviews yet for this product for now.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
