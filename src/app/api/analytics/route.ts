import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import Product from '@/models/Product';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!['visit', 'product_view', 'add_to_cart'].includes(body.type)) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    await dbConnect();
    await AnalyticsEvent.create({ type: body.type, productId: body.productId || undefined, path: String(body.path || '').slice(0, 300), visitorId: String(body.visitorId || '').slice(0, 100) });
    if (body.productId && body.type === 'product_view') await Product.findByIdAndUpdate(body.productId, { $inc: { viewCount: 1 } });
    if (body.productId && body.type === 'add_to_cart') await Product.findByIdAndUpdate(body.productId, { $inc: { addToCartCount: 1 } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Unable to record analytics' }, { status: 500 }); }
}
