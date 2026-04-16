import { NextRequest, NextResponse } from 'next/server';
import data from '@/lib/data';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();

        // Create Users (hash passwords)
        const users = await Promise.all(data.users.map(async (user) => {
            return {
                ...user,
                password: bcrypt.hashSync(user.password),
            };
        }));

        await User.insertMany(users);
        await Product.insertMany(data.products);

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error: unknown) {
        if (error instanceof Error){
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
