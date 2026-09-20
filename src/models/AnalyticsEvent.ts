import mongoose from 'mongoose';

const AnalyticsEventSchema = new mongoose.Schema({
  type: { type: String, enum: ['visit', 'product_view', 'add_to_cart'], required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  path: { type: String },
  visitorId: { type: String },
}, { timestamps: true });

AnalyticsEventSchema.index({ type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ productId: 1, type: 1 });

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
