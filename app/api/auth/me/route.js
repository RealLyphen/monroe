import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const KEYS_PATH = path.join(process.cwd(), 'data', 'keys.json');

function loadKeys() {
  try {
    return JSON.parse(fs.readFileSync(KEYS_PATH, 'utf-8'));
  } catch {
    return { keys: {} };
  }
}

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

    const data = loadKeys();
    const userInfo = data.keys[session.value];

    if (!userInfo) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: userInfo.username,
        telegramId: userInfo.telegramId,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
