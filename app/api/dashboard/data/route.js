import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function loadJson(filename) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    if (filename === 'keys.json') return { keys: {} };
    if (filename === 'wallets.json') return {};
    return [];
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.value === 'ADMIN-01';
    const allPackages = loadJson('packages.json');
    const allAddresses = loadJson('addresses.json');
    const allNotifications = loadJson('notifications.json');
    const keysData = loadJson('keys.json');
    const walletsData = loadJson('wallets.json');

    // Admin sees everything (but only ALL or ADMIN notifications in their own panel usually, 
    // though the prompt says owner currently sees user notifications. So we filter `allNotifications` 
    // directly in the API for what the admin receives in `dashboard/data`).
    if (isAdmin) {
      return NextResponse.json({
        packages: allPackages,
        addresses: allAddresses,
        users: Object.values(keysData.keys || {}),
        notifications: allNotifications.filter(n => n.target === 'ALL' || n.target === 'ADMIN'),
        wallets: walletsData
      });
    }

    // Normal user sees only their stuff
    const userSession = keysData.keys[session.value];
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const username = userSession.username;
    const userPackages = allPackages.filter(p => p.username === username);
    const userNotifications = allNotifications.filter(n => n.target === 'ALL' || n.target === username);
    const activeAddresses = allAddresses.filter(a => a.active !== false);
    const userWallet = walletsData[username] || { balance: 0, transactions: [] };

    return NextResponse.json({
      packages: userPackages,
      addresses: activeAddresses,
      notifications: userNotifications,
      wallet: userWallet
    });

  } catch (error) {
    console.error('Error in /api/dashboard/data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
