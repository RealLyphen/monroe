import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const WALLETS_PATH = path.join(process.cwd(), 'data', 'wallets.json');

function loadJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return {}; } }
function saveJson(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

// GET /api/admin/wallet?username=xxx (admin gets any, user gets own)
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');
    if (!session || !session.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wallets = loadJson(WALLETS_PATH);
    const isAdmin = session.value === 'ADMIN-01';

    if (isAdmin) {
      const { searchParams } = new URL(req.url);
      const username = searchParams.get('username');
      if (username) {
        return NextResponse.json({ wallet: wallets[username] || { balance: 0, transactions: [] } });
      }
      return NextResponse.json({ wallets });
    }

    // Normal user — get their own wallet
    const keysPath = path.join(process.cwd(), 'data', 'keys.json');
    const keysData = JSON.parse(fs.readFileSync(keysPath, 'utf-8'));
    const userInfo = keysData.keys?.[session.value];
    if (!userInfo) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userWallet = wallets[userInfo.username] || { balance: 0, transactions: [] };
    return NextResponse.json({ wallet: userWallet });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/wallet { username, amount, type: 'credit'|'debit', note }
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');
    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username, amount, type, note } = await req.json();
    if (!username || !amount || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const wallets = loadJson(WALLETS_PATH);
    if (!wallets[username]) wallets[username] = { balance: 0, transactions: [] };

    const numAmount = parseFloat(amount);
    if (type === 'credit') {
      wallets[username].balance += numAmount;
    } else if (type === 'debit') {
      wallets[username].balance -= numAmount;
    }

    wallets[username].transactions.unshift({
      id: `TXN-${Date.now()}`,
      type,
      amount: numAmount,
      note: note || '',
      createdAt: new Date().toISOString()
    });

    saveJson(WALLETS_PATH, wallets);
    return NextResponse.json({ success: true, wallet: wallets[username] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
