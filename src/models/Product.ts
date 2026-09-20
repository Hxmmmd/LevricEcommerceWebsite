import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Renamed from name
    slug: { type: String, required: true }, // Removed unique: true here as it's indexed below
    category: { type: String, required: true },
    // image: { type: String, required: true }, // Removed
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    numSales: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 }, // Renamed from countInStock
    description: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    condition: { type: String, enum: ['New', 'Used'], default: 'New' },
    discount: { type: Number, default: 0 },
    discountExpiry: { type: Date },
    images: { type: [String], default: [] }, // Array of image URLs
    availableColors: { type: [String], default: ['Midnight', 'Silver', 'Space Gray'] },
    isNewProduct: { type: Boolean, default: true },
    reviews: [
        {
            user: { type: String, required: true },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
            images: { type: [String], default: [] },
            createdAt: { type: Date, default: Date.now },
        }
    ],
}, { timestamps: true });

// Add indexes for optimized queries
ProductSchema.index({ title: 'text', description: 'text', category: 'text' }); // Text search index
ProductSchema.index({ category: 1, condition: 1 }); // Compound index for filtering
ProductSchema.index({ price: 1 }); // Price sorting/filtering
ProductSchema.index({ rating: -1, numReviews: -1 }); // Popularity sorting
ProductSchema.index({ createdAt: -1 }); // New arrivals sorting
ProductSchema.index({ slug: 1 }); // Unique slug lookup

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
