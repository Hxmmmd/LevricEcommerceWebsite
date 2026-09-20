import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Relaxed required for backward compatibility
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        // name and image are not in the diagram for Order items, 
        // but typically needed for efficient display without deep population every time.
        // I will keep them optional or remove them if strictly following "efficiently rewrite".
        // Use population for display to ensure data consistency with Products.
    }],
    totalAmount: { type: Number, required: true }, // Renamed from totalPrice
    shippingPrice: { type: Number, default: 0 },

    // Status enum as primary state
    status: {
        type: String,
        required: true,
        default: 'Processing',
        enum: ['Processing', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected']
    },

    // Keeping address and payment info as it's essential for an order, even if not in the simplified diagram
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, default: '' },
        address: { type: String, required: true },
        apartment: { type: String, default: '' },
        province: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, default: '' },
        alternatePhone: { type: String, default: '' },
        country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    isPaid: { type: Boolean, default: false }, // Added as requested
    deliveredAt: { type: Date },

    // Keeping timestamps for specific statuses might be useful, but 'status' field covers current state.
    // trackingHistory kept for detailed logs
    trackingHistory: [
        {
            status: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            message: { type: String }
        }
    ]
}, { timestamps: true });

// Add indexes for optimized queries
OrderSchema.index({ userId: 1, createdAt: -1 }); // User orders sorted by date
OrderSchema.index({ status: 1 }); // Status-based filtering

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
