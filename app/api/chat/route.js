import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CHAT_PATH = path.join(process.cwd(), 'data', 'chat.json');
const KEYS_PATH = path.join(process.cwd(), 'data', 'keys.json');

function loadJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return {}; } }
function saveJson(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

// GET /api/chat?packageId=PKG-123
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');
    if (!session || !session.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');
    if (!packageId) return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });

    const chatData = loadJson(CHAT_PATH);
    const messages = chatData[packageId] || [];

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

    if (!isAdmin) {
      const keysData = loadJson(KEYS_PATH);
      const userInfo = keysData.keys?.[session.value];
      if (!userInfo) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      senderName = userInfo.username;
      senderRole = 'user';
    }

    const { packageId, message, imageUrl } = await req.json();
    if (!packageId || (!message && !imageUrl)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const chatData = loadJson(CHAT_PATH);
    if (!chatData[packageId]) chatData[packageId] = [];

    const newMsg = {
      id: `MSG-${Date.now()}`,
      sender: senderName,
      role: senderRole,
      message: message || '',
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString()
    };

    chatData[packageId].push(newMsg);
    saveJson(CHAT_PATH, chatData);

    return NextResponse.json({ success: true, message: newMsg });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
