import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();
        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = bcrypt.hashSync(password);
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();
        return NextResponse.json({ message: 'User created' }, { status: 201 });
    } catch(error: unknown) {
        if (error instanceof Error){
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
