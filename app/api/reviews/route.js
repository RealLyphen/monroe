import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Review from '@/models/Review';

export async function GET() {
  await connectDB();
  const reviews = await Review.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ reviews });
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const isAdmin = session.value === 'ADMIN-01';
    let username = 'Admin';
    let userId = null;

    if (!isAdmin) {
      const user = await User.findOne({ key: session.value });
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      username = user.username;
      userId = user._id;
    }

    const { content, rating } = await req.json();

    if (!content || !rating) {
      return NextResponse.json({ error: 'Missing content or rating' }, { status: 400 });
    }

    const newReview = await Review.create({
      userId: userId,
      username: username,
      content: content.trim(),
      rating: rating,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
