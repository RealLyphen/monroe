import connectDB from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const { key } = await request.json();

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const trimmedKey = key.trim();

    // Special case for Static Admin Key
    if (trimmedKey === 'ADMIN-01') {
      const cookieStore = await cookies();
      cookieStore.set('monroe_session', 'ADMIN-01', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });

      return NextResponse.json({
        success: true,
        user: {
          username: 'OWNER',
          role: 'admin',
        },
      });
    }

    await connectDB();
    const user = await User.findOne({ key: trimmedKey });

    if (!user) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('monroe_session', trimmedKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        telegramId: user.telegramId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
