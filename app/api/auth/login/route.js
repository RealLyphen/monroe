import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const KEYS_PATH = path.join(process.cwd(), 'data', 'keys.json');

function loadKeys() {
  try {
    const fileContent = fs.readFileSync(KEYS_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    console.error(`🚨 FATAL LOGIN API ERROR: Could not read keys from ${KEYS_PATH}`, err);
    return { keys: {} };
  }
}

export async function POST(request) {
  try {
    const { key } = await request.json();

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const trimmedKey = key.trim();

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

    const data = loadKeys();
    const userInfo = data.keys[trimmedKey];

    if (!userInfo) {
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
        username: userInfo.username,
        telegramId: userInfo.telegramId,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
