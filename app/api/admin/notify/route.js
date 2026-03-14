import connectDB from '@/lib/db';
import Notification from '@/models/Notification';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { target, title, message } = await req.json();

    if (!target || !title || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await connectDB();
    const newNotif = await Notification.create({
      target: target, // 'ALL' or specific username
      title: title.trim(),
      message: message.trim(),
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, notification: newNotif });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
