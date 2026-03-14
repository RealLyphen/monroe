import connectDB from '@/lib/db';
import User from '@/models/User';
import Chat from '@/models/Chat';
import Package from '@/models/Package';

// GET /api/chat?packageId=123 (Mongo _id)
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');
    if (!session || !session.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');
    if (!packageId) return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });

    await connectDB();
    const chat = await Chat.findOne({ packageId }).lean();
    const messages = chat ? chat.messages : [];

    return NextResponse.json({ messages });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/chat { packageId, message, imageUrl? }
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');
    if (!session || !session.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = session.value === 'ADMIN-01';
    let senderName = 'Admin';
    let senderRole = 'admin';

    await connectDB();
    if (!isAdmin) {
      const user = await User.findOne({ key: session.value });
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      senderName = user.username;
      senderRole = 'user';
    }

    const { packageId, message, imageUrl } = await req.json();
    if (!packageId || (!message && !imageUrl)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let chat = await Chat.findOne({ packageId });
    if (!chat) {
      chat = new Chat({ packageId, messages: [] });
    }

    const newMsg = {
      sender: senderRole, // Model uses sender as 'user'|'admin'
      role: senderRole,
      message: message || '',
      imageUrl: imageUrl || null,
      createdAt: new Date()
    };

    chat.messages.push(newMsg);
    await chat.save();

    return NextResponse.json({ success: true, message: { ...newMsg, sender: senderName } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
