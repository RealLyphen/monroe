import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'packages.json');

function loadPackages() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch { return []; }
}
function savePackages(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function loadKeys() {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'keys.json'), 'utf-8')); } catch { return { keys: {} }; }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Admins don't submit packages directly, only normal users do.
    const keysData = loadKeys();
    const user = keysData.keys[session.value];
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { addressId, addressCity, trackingId, note, forwardAddress, weight, dimensions } = await req.json();

    if (!addressCity || !trackingId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const packages = loadPackages();
    const newPackage = {
      id: `PKG-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.telegramId,
      username: user.username,
      addressId: addressId || 'UNKNOWN',
      addressCity: addressCity,
      trackingId: trackingId.trim(),
      note: note ? note.trim() : '',
      weight: weight || '',
      dimensions: dimensions || '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Save forwarding address if provided
    if (forwardAddress && forwardAddress.street && forwardAddress.city) {
      newPackage.forwardAddress = {
        name: (forwardAddress.name || '').trim(),
        street: forwardAddress.street.trim(),
        city: forwardAddress.city.trim(),
      };
    }

    packages.unshift(newPackage);
    savePackages(packages);

    return NextResponse.json({ success: true, package: newPackage });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
