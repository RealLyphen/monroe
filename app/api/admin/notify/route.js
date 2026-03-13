import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const NOTIFS_PATH = path.join(process.cwd(), 'data', 'notifications.json');

function loadJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; } }
function saveJson(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

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

    const notifications = loadJson(NOTIFS_PATH);
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      target: target, // 'ALL' or specific username
      title: title.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotif);
    saveJson(NOTIFS_PATH, notifications);

    return NextResponse.json({ success: true, notification: newNotif });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
