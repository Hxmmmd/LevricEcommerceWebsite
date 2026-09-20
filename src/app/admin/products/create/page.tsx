'use client';

import { createProduct } from '@/lib/actions/admin';
import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Eye, X, ImageIcon, AlertCircle } from 'lucide-react';

const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const MAX_SIZE = 1200;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', 0.8);
            };
        };
    });
};
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CreateProductPage() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const router = useRouter();

    // State for live preview
    const [previewData, setPreviewData] = useState({
        title: '',
        category: '',
        price: 0,
        discount: 0,
        stock: 0,
        condition: 'New' as 'New' | 'Used',
        image: '',
        images: [] as string[],
        description: '',
        slug: 'preview-slug'
    });

    const [managedImages, setManagedImages] = useState<string[]>([]);
    const [discountExpiryEnabled, setDiscountExpiryEnabled] = useState(false);
    const totalImages = managedImages.length;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setPreviewData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));

        if (name === 'images') {
            const urls = value.split(',').map(s => s.trim()).filter(Boolean);
            setManagedImages(urls);
            setPreviewData(prev => ({ ...prev, image: urls[0] || '', images: urls }));
        }
    };

    const removeImage = (indexToRemove: number) => {
        const updatedImages = managedImages.filter((_, index) => index !== indexToRemove);
        setManagedImages(updatedImages);
        setPreviewData(prev => ({
            ...prev,
            image: updatedImages[0] || '',
            images: updatedImages
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const fileUrls = fileArray.map(f => URL.createObjectURL(f));

        if (name === 'imageFile') {
            setManagedImages(prev => {
                const newArr = [...prev];
                if (newArr.length > 0) {
                    newArr[0] = fileUrls[0];
                } else {
                    newArr.push(fileUrls[0]);
                }
                return newArr;
            });
            setPreviewData(prev => ({ ...prev, image: fileUrls[0] }));
        } else if (name === 'imagesFiles') {
            setManagedImages(prev => [...prev, ...fileUrls]);
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (totalImages > 5) {
            setError(`You have selected ${totalImages} images. Maximum allowed is 5.`);
            return;
        }

        if (previewData.discount > 0 && !discountExpiryEnabled) {
            setError('Please enable an expiry date and time for discounted products.');
            return;
        }

        if (discountExpiryEnabled) {
            const form = event.currentTarget;
            const expiryDate = (form.elements.namedItem('discountExpiryDate') as HTMLInputElement)?.value;
            const expiryTime = (form.elements.namedItem('discountExpiryTime') as HTMLInputElement)?.value;
            if (!expiryDate || !expiryTime || new Date(`${expiryDate}T${expiryTime}`) <= new Date()) {
                setError('Discount expiry must be a future date and time.');
                return;
            }
        }

        setSubmitting(true);
        try {
            const form = event.currentTarget;
            const formData = new FormData();

            // Append non-file entries
            const entries = new FormData(form).entries();
            for (const [key, value] of Array.from(entries)) {
                if (!(value instanceof File)) {
                    formData.append(key, value);
                }
            }

            // Compressed Main Image
            const mainFile = (form.querySelector('input[name="imageFile"]') as HTMLInputElement)?.files?.[0];
            if (mainFile) {
                const compressed = await compressImage(mainFile);
                formData.append('imageFile', compressed);
            }

            // Compressed Additional Images
            const additionalFiles = (form.querySelector('input[name="imagesFiles"]') as HTMLInputElement)?.files;
            if (additionalFiles) {
                for (const file of Array.from(additionalFiles)) {
                    const compressed = await compressImage(file);
                    formData.append('imagesFiles', compressed);
                }
            }

            const result = await createProduct(formData);

            // If result is returned (error case), handle it
            if (result && !result.success) {
                setError(result.error || 'Failed to create product');
                setSubmitting(false);
            }
            // If no result, redirect happened successfully
        } catch (err: any) {
            // Check for NEXT_REDIRECT error
            if (err.message === 'NEXT_REDIRECT' || err.digest?.startsWith('NEXT_REDIRECT')) {
                // This is normal, allow redirect
                return;
            }
            console.error('Form submission error:', err);
            setError(err.message || 'An unexpected error occurred');
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-20 sm:space-y-8">
            <div className="flex items-center gap-2 md:gap-4 mt-4 md:mt-0">
                <Link href="/admin" className={cn(buttonVariants('ghost', 'icon'), "h-9 w-9 md:h-10 md:w-10")}>
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Catalog</p><h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Create new product</h1><p className="mt-1 text-sm text-muted-foreground">Add a product to your storefront with clear pricing, inventory, and media details.</p></div>
            </div>

            <div className="flex w-full max-w-md items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
                <button
                    onClick={() => setActiveTab('edit')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold transition-all relative",
                        activeTab === 'edit' ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    Edit Details
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold transition-all relative",
                        activeTab === 'preview' ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    Live Preview
                </button>
            </div>

            <div className="min-h-[600px] relative">
                {/* Form Side - Kept mounted to prevent state loss */}
                <div className={cn(activeTab !== 'edit' && "hidden")}>
                    <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-border bg-card p-4 shadow-sm animate-in fade-in duration-300 sm:p-6 lg:p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Title</label>
                                <input
                                    name="title"
                                    required
                                    type="text"
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    placeholder="Product Title"
                                    value={previewData.title}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Category</label>
                                <input
                                    name="category"
                                    required
                                    type="text"
                                    value={previewData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    placeholder="e.g. Laptops"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Price ($)</label>
                                <input
                                    name="price"
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={previewData.price || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    placeholder="99.99"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Discount (%)</label>
                                <input
                                    name="discount"
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="100"
                                    value={previewData.discount || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {previewData.discount > 0 && (
                            <div className="space-y-4 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={discountExpiryEnabled}
                                        onChange={(event) => setDiscountExpiryEnabled(event.target.checked)}
                                        className="mt-1 size-4 accent-blue-500"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-foreground">Set discount expiry</span>
                                        <span className="block text-xs text-muted-foreground">Choose when this discount should stop applying.</span>
                                    </span>
                                </label>
                                {discountExpiryEnabled && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Expiry date <span className="text-red-400">*</span></label>
                                            <input name="discountExpiryDate" required type="date" min={new Date().toISOString().split('T')[0]} className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Expiry time <span className="text-red-400">*</span></label>
                                            <input name="discountExpiryTime" required type="time" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Stock</label>
                                <input
                                    name="stock"
                                    required
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={previewData.stock || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground">Condition</label>
                                <div className="flex items-center space-x-6 h-12">
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="condition"
                                            value="New"
                                            checked={previewData.condition === 'New'}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-blue-500 bg-black/20 border-white/10 focus:ring-blue-500 focus:ring-offset-black"
                                        />
                                        <span className="text-white group-hover:text-blue-400 transition-colors">New</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="condition"
                                            value="Used"
                                            checked={previewData.condition === 'Used'}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-orange-500 bg-black/20 border-white/10 focus:ring-orange-500 focus:ring-offset-black"
                                        />
                                        <span className="text-white group-hover:text-orange-400 transition-colors">Used</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-foreground">Main Product Image (Upload or URL)</label>
                                <div className="space-y-2">
                                    <input name="imageFile" type="file" onChange={handleFileChange} accept="image/*" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20" />
                                    <input
                                        value={managedImages[0] || ''}
                                        name="image"
                                        type="text"
                                        onChange={(e) => {
                                            const newUrl = e.target.value;
                                            const newImages = [...managedImages];
                                            newImages[0] = newUrl;
                                            setManagedImages(newImages.filter(Boolean));
                                            handleInputChange(e);
                                        }}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs overflow-x-auto"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-foreground">Additional Gallery Images (Comma URLs)</label>
                                <textarea
                                    value={managedImages.slice(1).join(', ')}
                                    name="images"
                                    rows={3}
                                    onChange={(e) => {
                                        const urls = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                        setManagedImages([managedImages[0], ...urls].filter(Boolean));
                                    }}
                                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-mono scrollbar-thin scrollbar-thumb-white/10"
                                    placeholder="url1, url2, url3..."
                                />
                            </div>
                        </div>

                        {/* Visual Image Manager */}
                        {managedImages.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground">Selected Images (Select to remove)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {managedImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                                            <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                                            {/* Delete Button - Optimized for Mobile & Desktop */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 md:inset-0 bg-red-600 md:bg-red-600/60 md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center justify-center text-white p-1.5 md:p-0 rounded-full md:rounded-none shadow-lg md:shadow-none"
                                                title="Remove Image"
                                            >
                                                <X className="w-4 h-4 md:w-6 md:h-6" />
                                            </button>
                                            <div className="absolute top-1 left-1 bg-black/60 text-[8px] px-1.5 py-0.5 rounded text-white font-bold">
                                                {idx === 0 ? 'MAIN' : `GALLERY ${idx}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={cn(
                            "p-3 rounded-lg border text-sm flex justify-between items-center",
                            totalImages > 5 ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-blue-500/10 border-blue-500/50 text-blue-400"
                        )}>
                            <p>Total Images Selected: <strong>{totalImages}</strong></p>
                            <p className="text-xs">{totalImages > 5 ? "⚠️ Limit exceeded (Max 5)" : "Max 5 images allowed"}</p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/50 text-red-400">
                                <p className="font-semibold">Error:</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Description (Markdown Supported)</label>
                            <textarea
                                name="description"
                                required
                                rows={8}
                                value={previewData.description}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono text-sm"
                                placeholder="Use Markdown: **bold**, - lists, # headings..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/admin" className={buttonVariants('ghost')}>
                                Cancel
                            </Link>
                            <Button type="submit" disabled={submitting || totalImages > 5}>
                                {submitting ? 'Creating...' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Preview Tab */}
                <div className={cn(activeTab !== 'preview' && "hidden")}>
                    <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start animate-in zoom-in-95 duration-300">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-white font-bold text-sm px-2">
                                <Eye className="w-4 h-4 text-blue-400" />
                                Card Preview
                            </div>
                            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex justify-center shadow-sm">
                                <div className="w-full max-w-[300px]">
                                    <ProductCard
                                        product={{
                                            ...previewData,
                                            _id: 'preview',
                                            title: previewData.title || 'Product Title Preview',
                                            images: previewData.image ? [previewData.image] : ['/images/placeholder.jpg'],
                                            rating: 0,
                                            numReviews: 0,
                                            stock: previewData.stock || 0,
                                        }}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 text-center italic">
                                How your product appears in the shop grid.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-white font-bold text-sm px-2">
                                <Eye className="w-4 h-4 text-green-400" />
                                Full Description Preview
                            </div>
                            <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 min-h-[300px] shadow-sm">
                                <div className="prose prose-invert max-w-none">
                                    {previewData.description ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {previewData.description}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="text-gray-500 italic">No description provided yet...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
