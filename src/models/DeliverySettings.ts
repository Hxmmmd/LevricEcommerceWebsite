import mongoose from 'mongoose';

const DeliverySettingsSchema = new mongoose.Schema({
    cashOnDeliveryFee: { type: Number, required: true, default: 10, min: 0 },
}, { timestamps: true });

export default mongoose.models.DeliverySettings || mongoose.model('DeliverySettings', DeliverySettingsSchema);
