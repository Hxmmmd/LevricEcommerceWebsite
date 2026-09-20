'use server';

import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import Order from '@/models/Order';
import User from '@/models/User';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function getProducts(params: { query?: string, condition?: string, category?: string, minPrice?: string, maxPrice?: string } = {}) {
    await dbConnect();
    const filter: any = {};

    function sanitizeRegex(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if (params.query) {
        const sanitizedQuery = sanitizeRegex(params.query);
        filter.$or = [
            { title: { $regex: sanitizedQuery, $options: 'i' } }, // Renamed from name
            { category: { $regex: sanitizedQuery, $options: 'i' } },
            { condition: { $regex: sanitizedQuery, $options: 'i' } },
            { description: { $regex: sanitizedQuery, $options: 'i' } }
        ];
    }

    if (params.condition) filter.condition = params.condition;
    if (params.category) filter.category = params.category;

    // Price filtering logic (simplified for brevity, ensuring it works)
    if (params.minPrice || params.maxPrice) {
        const min = Number(params.minPrice);
        const max = Number(params.maxPrice);

        if (!isNaN(min)) filter.price = { ...filter.price, $gte: min };
        if (!isNaN(max)) filter.price = { ...filter.price, $lte: max };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return products.map((product: any) => ({
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt ? product.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString(),
        discountExpiry: product.discountExpiry ? product.discountExpiry.toISOString() : null,
        // Backward comp
        image: product.images?.[0] || '',
        name: product.title,
        countInStock: product.stock
    }));
}

export async function getProduct(id: string) {
    await dbConnect();
    const product: any = await Product.findById(id).lean();
    if (!product) return null;
    return {
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt ? product.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString(),
        discountExpiry: product.discountExpiry ? product.discountExpiry.toISOString() : null,
        // Map for frontend
        image: product.images?.[0] || '',
        name: product.title,
        countInStock: product.stock
    };
}

// Helper to get Base64
async function fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

function parseProductFields(formData: FormData) {
    const title = String(formData.get('title') || formData.get('name') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const price = Number(formData.get('price'));
    const discount = Number(formData.get('discount') || 0);
    const stock = Number(formData.get('stock') ?? formData.get('countInStock'));
    const condition = String(formData.get('condition') || 'New');
    const expiryDate = String(formData.get('discountExpiryDate') || '');
    const expiryTime = String(formData.get('discountExpiryTime') || '');
    const discountExpiry = expiryDate && expiryTime ? new Date(`${expiryDate}T${expiryTime}`) : null;

    if (!title || title.length < 2) throw new Error('Product title must be at least 2 characters.');
    if (!category) throw new Error('Product category is required.');
    if (!description || description.length < 10) throw new Error('Description must be at least 10 characters.');
    if (!Number.isFinite(price) || price <= 0) throw new Error('Price must be greater than 0.');
    if (!Number.isInteger(stock) || stock < 0) throw new Error('Stock must be a whole number of 0 or more.');
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) throw new Error('Discount must be between 0 and 100%.');
    if (!['New', 'Used'].includes(condition)) throw new Error('Choose a valid product condition.');
    if (discount > 0 && !discountExpiry) throw new Error('Discounted products require an expiry date and time.');
    if (discountExpiry && (Number.isNaN(discountExpiry.getTime()) || discountExpiry <= new Date())) {
        throw new Error('Discount expiry must be a valid future date and time.');
    }

    return { title, category, description, price, discount, stock, condition, discountExpiry };
}

export async function createProduct(formData: FormData) {
    try {
        console.log('Starting product creation...');
        await dbConnect();

        const { title, price, discount, discountExpiry, category, description, stock, condition } = parseProductFields(formData);

        const mainImageFile = formData.get('imageFile') as File;
        const additionalImageFiles = formData.getAll('imagesFiles') as File[];
        let image = formData.get('image') as string;

        if (mainImageFile && mainImageFile.size > 0) {
            console.log('Converting main image to Base64...');
            if (mainImageFile.size > 4 * 1024 * 1024) throw new Error("Main image too large (max 4MB)");
            image = await fileToBase64(mainImageFile);
        }

        // Create a unique set of images
        let finalImages: string[] = [];

        // 1. Start with images from the textarea (existing URLs or Base64s)
        const existingImagesFromForm = (formData.get('images') as string || '').split(',').map(s => s.trim()).filter(Boolean);
        finalImages = [...existingImagesFromForm];

        // 2. Add main image if provided (URL or Base64)
        if (image) {
            finalImages = [image, ...finalImages];
        }

        // 3. Add any newly uploaded additional files
        if (additionalImageFiles && additionalImageFiles.length > 0) {
            for (const file of additionalImageFiles) {
                if (file.size > 0) {
                    console.log('Converting additional image to Base64...');
                    if (file.size > 4 * 1024 * 1024) throw new Error(`Image ${file.name} too large (max 4MB)`);
                    const base64 = await fileToBase64(file);
                    finalImages.push(base64);
                }
            }
        }

        // Final deduplication and limit
        finalImages = [...new Set(finalImages)].slice(0, 5);
        if (finalImages.length === 0) throw new Error('Add a main product image by upload or URL.');

        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        await Product.create({
            title,
            slug,
            price,
            discount,
            discountExpiry,
            images: finalImages,
            category,
            description,
            stock,
            condition,
            isNewProduct: condition === 'New'
        });

        revalidatePath('/admin');
        revalidatePath('/products');
    } catch (error: any) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message || 'Failed to create product' };
    }

    redirect('/admin');
}

export async function updateProduct(id: string, formData: FormData) {
    try {
        await dbConnect();

        const { title, price, discount, discountExpiry, category, description, stock, condition } = parseProductFields(formData);

        const mainImageFile = formData.get('imageFile') as File;
        const additionalImageFiles = formData.getAll('imagesFiles') as File[];
        let image = formData.get('image') as string;

        if (mainImageFile && mainImageFile.size > 0) {
            if (mainImageFile.size > 4 * 1024 * 1024) throw new Error("Main image too large (max 4MB)");
            image = await fileToBase64(mainImageFile);
        }

        // Create a unique set of images
        let finalImages: string[] = [];

        // 1. Start with images from the textarea (existing URLs or Base64s)
        const existingImagesFromForm = (formData.get('images') as string || '').split(',').map(s => s.trim()).filter(Boolean);
        finalImages = [...existingImagesFromForm];

        // 2. Add main image if provided (URL or Base64)
        if (image) {
            finalImages = [image, ...finalImages];
        }

        // 3. Add any newly uploaded additional files
        if (additionalImageFiles && additionalImageFiles.length > 0) {
            for (const file of additionalImageFiles) {
                if (file.size > 0) {
                    if (file.size > 4 * 1024 * 1024) throw new Error(`Image ${file.name} too large (max 4MB)`);
                    const base64 = await fileToBase64(file);
                    finalImages.push(base64);
                }
            }
        }

        // Final deduplication and limit
        finalImages = [...new Set(finalImages)].slice(0, 5);

        await Product.findByIdAndUpdate(id, {
            title,
            price,
            discount,
            discountExpiry,
            images: finalImages,
            category,
            description,
            stock,
            condition,
            isNewProduct: condition === 'New'
        });

        revalidatePath('/admin');
        revalidatePath('/products');
        revalidatePath(`/products/${id}`);
    } catch (error: any) {
        console.error('Error updating product:', error);
        throw error;
    }

    redirect('/admin');
}

export async function deleteProduct(id: string) {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath('/admin');
    revalidatePath('/products');
}

export async function getOrders() {
    const { unstable_noStore: noStore } = await import('next/cache');
    noStore();
    await dbConnect();

    const orders = await Order.find({
        status: { $nin: ['Cancelled', 'Rejected'] }
    })
        .populate('userId', 'name email')
        .populate('items.productId')
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(orders));
}

export async function updateOrderStatus(id: string, status: { isPaid?: boolean, isDelivered?: boolean }) {
    try {
        await dbConnect();
        const update: any = {};
        if (status.isDelivered) {
            update.status = 'Delivered';
        }
        await Order.findByIdAndUpdate(id, { $set: update });
        revalidatePath('/admin/orders');
        revalidatePath('/orders');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTrackingStatus(id: string, status: string) {
    try {
        await dbConnect();

        // We need to fetch the order first to check conditions (COD, etc), 
        // but we use lean() to avoid full hydration/validation at this stage if possible,
        // or just findById is fine, but we won't call .save() on it.
        const order = await Order.findById(id).lean();

        if (!order) return { success: false, error: 'Order not found' };

        const statusMessages: any = {
            'Packing': 'Apka product ki packing ho rahi hai abhi',
            'Shipped': 'Apka product humare warehouse se nikal gaya hai',
            'Out for Delivery': 'Apka product humare delivery partners le ke nikal chuke hain itne time tak pouch jaye ga',
            'Delivered': 'You received your package'
        };

        const updateFields: any = {
            status: status
        };

        if (status === 'Delivered') {
            updateFields.deliveredAt = new Date();
            if (order.paymentMethod === 'COD') {
                updateFields.paymentStatus = 'Completed';
            }
        }

        const trackingEntry = {
            status,
            timestamp: new Date(),
            message: statusMessages[status] || `Status updated to ${status}`
        };

        await Order.findByIdAndUpdate(id, {
            $set: updateFields,
            $push: { trackingHistory: trackingEntry }
        });

        revalidatePath('/admin/orders');
        revalidatePath(`/orders/${id}/track`);
        revalidatePath('/orders');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Update Tracking Error:', error);
        return { success: false, error: error.message };
    }
}

export async function rejectOrder(id: string) {
    try {
        await dbConnect();
        // Use lean() for performance and to bypass full hydration since we rely on explicit updates
        const order = await Order.findById(id).lean();

        if (!order) return { success: false, error: 'Order not found' };
        if (order.status === 'Rejected') return { success: false, error: 'Order is already rejected' };
        if (order.status === 'Delivered') return { success: false, error: 'Cannot reject a delivered order' };

        // Restore stock levels
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: {
                    stock: item.quantity,
                    numSales: -item.quantity
                }
            });
        }

        const trackingEntry = {
            status: 'Rejected',
            timestamp: new Date(),
            message: 'Order was rejected by admin'
        };

        // Use findByIdAndUpdate to bypass strict schema validation that might fail on .save() for legacy docs
        await Order.findByIdAndUpdate(id, {
            $set: { status: 'Rejected' },
            $push: { trackingHistory: trackingEntry }
        });

        revalidatePath('/admin/orders');
        revalidatePath('/orders');
        revalidatePath(`/orders/${id}/track`);
        revalidatePath(`/products`);
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// User & Admin Management
export async function getAllUsers(): Promise<any[]> {
    const session = await auth();
    if (!session || !session.user.isAdmin) {
        throw new Error('Unauthorized');
    }

    await dbConnect();
    const users = await User.find({}).select('-password').sort({ role: 1, createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(users));
}

export async function createAdminUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session || !session.user.isAdmin) {
        throw new Error('Unauthorized');
    }

    await dbConnect();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        throw new Error('All fields are required');
    }

    if (!email.includes('@')) {
        throw new Error('Please provide a valid email address');
    }

    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Create Admin Error:', error);
        throw new Error(error.message || 'Error occurred while creating admin user');
    }
}

export async function deleteUser(userId: string, adminPassword?: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session || !session.user.isAdmin) {
        throw new Error('Unauthorized');
    }

    if (!adminPassword) {
        throw new Error('Admin password is required for confirmation');
    }

    // Prevent deleting self
    if (session.user.id === userId) {
        throw new Error('You cannot delete your own account from here');
    }

    await dbConnect();

    // Check admin's password
    const adminUser = await User.findById(session.user.id);
    if (!adminUser || !bcrypt.compareSync(adminPassword, adminUser.password)) {
        throw new Error('Invalid admin password. Verification failed.');
    }

    try {
        await User.findByIdAndDelete(userId);
        revalidatePath('/profile');
        return { success: true };
    } catch (error: any) {
        console.error('Delete User Error:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}
