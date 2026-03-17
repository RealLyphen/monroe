import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    // Only allow Super Admins
    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let PAYOUT_KEY = process.env.OXAPAY_PAYOUT_KEY;
    if (!PAYOUT_KEY) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
        const match = envContent.match(/OXAPAY_PAYOUT_KEY=(.*)/);
        if (match) PAYOUT_KEY = match[1].trim();
      } catch (e) {}
    }

    if (!PAYOUT_KEY) {
      return NextResponse.json({ error: 'Payout Key not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.oxapay.com/api/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: PAYOUT_KEY })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OxaPay Balance API error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch OxaPay balance' }, { status: 500 });
    }

    const data = await res.json();

    if (data.result !== 100) {
      console.error('OxaPay Balance logic error:', data.message);
      return NextResponse.json({ error: data.message || 'Error fetching balance' }, { status: 400 });
    }

    // Data format usually is `{ result: 100, message: "success", USDT: 10.5, TRX: 100 ... }`
    // Returning the entire object minus metadata
    const { result, message, ...balances } = data;

    return NextResponse.json({ balances });
  } catch (error) {
    console.error('Admin OxaPay Balance Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
