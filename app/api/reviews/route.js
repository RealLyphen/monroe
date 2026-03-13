import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REVIEWS_PATH = path.join(process.cwd(), 'data', 'reviews.json');
const KEYS_PATH = path.join(process.cwd(), 'data', 'keys.json');

function loadJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; } }
function loadKeys() { try { return JSON.parse(fs.readFileSync(KEYS_PATH, 'utf-8')); } catch { return { keys: {} }; } }
function saveJson(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

export async function GET() {
  const reviews = loadJson(REVIEWS_PATH);
  return NextResponse.json({ reviews });
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keysData = loadKeys();
    const user = keysData.keys[session.value];
    
    // Admin posts as Owner
    const username = session.value === 'ADMIN-01' ? 'Admin' : user?.username;

    if (!username) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, rating } = await req.json();

    if (!content || !rating) {
      return NextResponse.json({ error: 'Missing content or rating' }, { status: 400 });
    }

    const reviews = loadJson(REVIEWS_PATH);
    const newReview = {
      id: `REV-${Date.now()}`,
      username: username,
      content: content.trim(),
      rating: rating,
      date: new Date().toISOString()
    };

    reviews.unshift(newReview);
    saveJson(REVIEWS_PATH, reviews);

    return NextResponse.json({ success: true, review: newReview });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
