import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getProducts, deleteProduct, getDeliverySettings, updateDeliverySettings, getAdminAnalytics, updateInventory } from '@/lib/actions/admin';
import { Plus, Edit, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Search from '@/components/Search';

import ProductFilters from '@/components/ProductFilters';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({
    searchParams
}: {
    searchParams: Promise<{ q?: string, condition?: string, category?: string, minPrice?: string, maxPrice?: string }>
}) {
    const params = await searchParams;
    const [products, deliverySettings, analytics, dayAnalytics, weekAnalytics, yearAnalytics] = await Promise.all([
        getProducts({
        query: params.q,
        condition: params.condition,
        category: params.category,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice
        }),
        getDeliverySettings(),
        getAdminAnalytics('month'),
        getAdminAnalytics('day'),
        getAdminAnalytics('week'),
        getAdminAnalytics('year')
    ]);

    return (
        <div className="min-w-0 space-y-6 sm:space-y-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[['Sales today', `$${dayAnalytics.sales.total.toFixed(2)}`], ['Sales this week', `$${weekAnalytics.sales.total.toFixed(2)}`], ['Sales this month', `$${analytics.sales.total.toFixed(2)}`], ['Sales this year', `$${yearAnalytics.sales.total.toFixed(2)}`], ['New visitors', analytics.visitors]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-black text-foreground">{value}</p></div>)}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">Product performance</p><h2 className="mt-1 text-lg font-bold text-foreground">Views, add-to-cart, and sales</h2></div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{analytics.products.slice(0, 5).map((product: any) => <div key={product._id} className="rounded-xl border border-border bg-muted/30 p-3"><p className="truncate text-sm font-semibold text-foreground">{product.title}</p><p className="mt-2 text-xs text-muted-foreground">Views {product.viewCount || 0} · Cart {product.addToCartCount || 0}</p><p className="text-xs text-muted-foreground">Sold {product.numSales || 0}</p></div>)}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">Checkout settings</p><h2 className="mt-1 text-lg font-bold text-foreground">Cash on delivery fee</h2><p className="mt-1 text-sm text-muted-foreground">Customers using COD pay this fee. Card payments stay free.</p></div>
                    <form action={updateDeliverySettings} className="flex w-full max-w-sm items-end gap-2">
                        <label className="min-w-0 flex-1"><span className="mb-2 block text-xs font-medium text-muted-foreground">Fee in USD</span><input name="cashOnDeliveryFee" type="number" min="0" max="10000" step="0.01" defaultValue={deliverySettings.cashOnDeliveryFee} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring/40" /></label>
                        <Button type="submit" className="h-11 rounded-xl">Save fee</Button>
                    </form>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Products Management</h1>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="w-full sm:w-auto sm:flex-1 sm:max-w-md">
                        <Search isAdmin className="w-full" />
                    </div>

                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                        <Link href="/admin/orders" className="flex-1 sm:flex-initial">
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-border hover:bg-accent text-sm">
                                <ShoppingBag className="w-4 h-4" /> <span className="sm:hidden lg:inline">Orders</span><span className="hidden sm:inline lg:hidden">Orders</span>
                            </Button>
                        </Link>

                        <Link href="/admin/products/create" className="flex-1 sm:flex-initial">
                            <Button className="w-full flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 text-sm">
                                <Plus className="w-4 h-4" /> Add New
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-8">
                {/* Sidebar Filters */}
                <aside>
                    <ProductFilters />
                </aside>

                {/* Products Table Area */}
                {/* Products Table/Card Area */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/60 border-b border-border">
                                    <th className="p-4 text-sm font-medium text-gray-400">Image</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Name</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Cond.</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Category</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Price</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Values</th>
                                    <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            No products found. Start by creating one.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product._id} className="hover:bg-accent/50 transition-colors">
                                            <td className="p-4">
                                                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-800">
                                                    <Image
                                                        src={product.images?.[0] || '/images/placeholder.jpg'}
                                                        alt={product.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-white">{product.title}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${product.condition === 'New' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                    {product.condition || 'New'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400">{product.category}</td>
                                            <td className="p-4 text-white">
                                                {product.discount > 0 ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-red-400">-{product.discount}%</span>
                                                        <span>${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <span>${product.price}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                <form action={async (formData) => { 'use server'; await updateInventory(product._id, Number(formData.get('stock'))); }} className="flex items-center gap-2"><label className="sr-only" htmlFor={`stock-${product._id}`}>Stock for {product.title}</label><input id={`stock-${product._id}`} name="stock" type="number" min="0" step="1" defaultValue={product.stock} className="h-8 w-20 rounded-lg border border-input bg-background px-2 text-foreground" /><Button type="submit" variant="outline" size="sm" className="h-8">Save</Button></form>
                                                <span className="mt-1 block">Rating: {product.rating || 'N/A'}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/products/${product._id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-500/20 hover:text-blue-400">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <form action={async () => {
                                                        'use server';
                                                        await deleteProduct(product._id);
                                                    }}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-border">
                        {products.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No products found. Start by creating one.
                            </div>
                        ) : (
                            products.map((product) => (
                                <div key={product._id} className="p-4 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-800 border border-white/5">
                                            <Image
                                                src={product.images?.[0] || '/images/placeholder.jpg'}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold text-white truncate">{product.title}</h3>
                                                <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider shrink-0 ${product.condition === 'New' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                    {product.condition || 'New'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{product.category}</p>
                                            <div className="pt-1">
                                                {product.discount > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-bold">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                                                        <span className="text-[10px] text-red-400 line-through">${product.price}</span>
                                                        <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">-{product.discount}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-white font-bold">${product.price}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <div className="flex flex-col text-[10px] text-gray-500">
                                            <span>Stock: <span className="text-gray-300">{product.stock}</span></span>
                                            <span>Rating: <span className="text-gray-300">★ {product.rating || 'N/A'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/products/${product._id}/edit`} className="flex-1">
                                                <Button variant="outline" size="sm" className="h-9 px-4 border-white/10 text-xs hover:bg-accent/50 w-full">
                                                    <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                                                </Button>
                                            </Link>
                                            <form action={async () => {
                                                'use server';
                                                await deleteProduct(product._id);
                                            }}>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-red-500/20 hover:text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
