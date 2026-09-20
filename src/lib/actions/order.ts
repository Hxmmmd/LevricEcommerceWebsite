'use server';

import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { auth } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import DeliverySettings from '@/models/DeliverySettings';

export async function getProductBySlug(slug: string) {
    noStore();
    await dbConnect();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return null;
    return {
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt ? product.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString(),
        images: product.images || [], // Ensure images array
        // Map old fields if frontend still expects them temporarily/safely
        image: product.images?.[0] || '',
        name: product.title,
        countInStock: product.stock
    };
}

export async function getCheckoutSettings() {
    await dbConnect();
    const settings = await DeliverySettings.findOne().sort({ createdAt: 1 }).lean();
    return { cashOnDeliveryFee: settings?.cashOnDeliveryFee ?? 10 };
}

export async function createOrder(orderData: any) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    await dbConnect();

    // Verify items from Cart collection or passed data
    // Assuming orderData.orderItems might still be passed from frontend, 
    // but better to rely on server-side cart for security if possible.
    // However, usually checkout passes the snapshot. 
    // Let's validate against DB products.

    let totalItemsPrice = 0;
    const orderItems = [];

    for (const item of orderData.orderItems) {
        const product = await Product.findById(item.product); // item.product is ID
        if (!product) throw new Error(`Product ${item.product} not found`);

        // Use effective price (considering discount)
        const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
        totalItemsPrice += discountedPrice * item.qty;

        orderItems.push({
            productId: product._id,
            quantity: item.qty,
            price: discountedPrice,
            // name and image removed from core schema but can be populated
        });

        // Reduce stock and increment sales
        if (product.stock < item.qty) {
            throw new Error(`Not enough stock for ${product.title}`);
        }
        product.stock -= item.qty; // Renamed from countInStock
        product.numSales = (product.numSales || 0) + item.qty;

        await product.save();
    }

    const shippingAddress = orderData.shippingAddress || {};
    const phonePattern = /^03\d{9}$/;
    if (!phonePattern.test(String(shippingAddress.phone || ''))) throw new Error('A valid Pakistani phone number is required.');
    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address || !shippingAddress.province || !shippingAddress.city) throw new Error('Please complete all required delivery fields.');
    if (shippingAddress.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) throw new Error('Please enter a valid email address.');

    const settings = await DeliverySettings.findOne().sort({ createdAt: 1 }).lean();
    const cashOnDeliveryFee = settings?.cashOnDeliveryFee ?? 10;
    const paymentMethod = orderData.paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Credit Card';
    const shippingPrice = paymentMethod === 'Cash on Delivery' ? cashOnDeliveryFee : 0;

    const order = new Order({
        userId: session.user.id, // Renamed from user
        items: orderItems, // Renamed from orderItems
        shippingAddress: {
            ...shippingAddress,
            fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
            email: shippingAddress.email || '',
            apartment: shippingAddress.apartment || '',
            province: shippingAddress.province,
            postalCode: shippingAddress.postalCode || '',
            alternatePhone: shippingAddress.alternatePhone || ''
        },
        paymentMethod,
        paymentStatus: 'Pending', // Explicitly set default
        isPaid: false, // Default false
        shippingPrice,
        totalAmount: totalItemsPrice + shippingPrice,
        status: 'Processing',
        trackingHistory: [{
            status: 'Processing',
            timestamp: new Date(),
            message: 'Order received'
        }]
    });

    const createdOrder = await order.save();

    // Clear user's cart
    await Cart.findOneAndDelete({ userId: session.user.id });

    revalidatePath('/admin/orders');
    revalidatePath('/cart');
    return JSON.parse(JSON.stringify(createdOrder));
}

export async function validateProducts(productIds: string[]) {
    await dbConnect();
    // Select only required fields
    const products = await Product.find({ _id: { $in: productIds } })
        .select('_id title slug images price stock discount')
        .lean();
    return JSON.parse(JSON.stringify(products));
}

export async function getMyOrders() {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    noStore(); // Force fresh data
    await dbConnect();
    const orders = await Order.find({ userId: session.user.id })
        .populate({
            path: 'items.productId',
            select: '_id title slug images price' // Only fetch needed fields
        })
        .sort({ createdAt: -1 })
        .lean();

    // Transform for frontend if needed
    return JSON.parse(JSON.stringify(orders));
}

export async function getOrderById(id: string) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    await dbConnect();
    const order = await Order.findById(id)
        .populate({
            path: 'items.productId',
            select: '_id title slug images price'
        })
        .lean();

    if (!order) return null;
    if (order.userId.toString() !== session.user.id) { // Renamed from user
        throw new Error('Unauthorized');
    }

    return JSON.parse(JSON.stringify(order));
}

export async function cancelOrder(orderId: string, password?: string) {
    const session = await auth();
    if (!session || !session.user) throw new Error('Authentication required');

    if (!password) throw new Error('Password is required for cancellation');

    await dbConnect();

    // Verify password
    const user = await User.findById(session.user.id);
    if (!user) throw new Error('User not found');

    if (!user.password) throw new Error('Password verification not available for this account type');

    try {
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) throw new Error('Incorrect password');
    } catch (e: any) {
        throw new Error('Password verification failed: ' + e.message);
    }

    const order = await Order.findById(orderId);

    if (!order) throw new Error('Order not found');
    if (order.userId.toString() !== session.user.id) throw new Error('Unauthorized');
    if (order.status === 'Cancelled') throw new Error('Order is already cancelled');
    if (order.status === 'Delivered') throw new Error('Cannot cancel a delivered order');

    // Check 24-hour window
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    const minutesPassed = (currentTime - orderTime) / (1000 * 60);

    if (minutesPassed > 1440) { // 24 hours
        throw new Error(`Cancellation window of 24 hours has expired`);
    }

    // Restore stock and decrement sales
    for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
            product.stock += item.quantity;
            product.numSales = (product.numSales || 0) - item.quantity;
            await product.save();
        }
    }

    // Update order status
    order.status = 'Cancelled';
    order.trackingHistory.push({
        status: 'Cancelled',
        timestamp: new Date(),
        message: 'Order was cancelled by user'
    });

    await order.save();

    revalidatePath('/orders');
    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${orderId}/track`);
    revalidatePath(`/products`);
    revalidatePath('/');
    return { success: true, order: JSON.parse(JSON.stringify(order)) };
}
