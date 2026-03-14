import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (session.value === 'ADMIN-01') {
      return NextResponse.json({
        authenticated: true,
        user: {
          username: 'OWNER',
          role: 'admin',
        },
      });
    }

    await connectDB();
    const user = await User.findOne({ key: session.value });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: user.username,
        telegramId: user.telegramId,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
