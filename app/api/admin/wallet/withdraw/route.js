import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
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

    const { amount, currency, address, network } = await req.json();

    if (!amount || !currency || !address) {
      return NextResponse.json({ error: 'Amount, currency, and address are required' }, { status: 400 });
    }

    const payload = {
      key: PAYOUT_KEY,
      amount: parseFloat(amount),
      currency: currency,
      address: address,
      network: network || undefined, // e.g. TRC20 for USDT
      description: "Admin Withdraw from Dashboard"
    };

    const res = await fetch('https://api.oxapay.com/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OxaPay Send API error:', errorText);
      return NextResponse.json({ error: 'Failed to initiate OxaPay withdraw' }, { status: 500 });
    }

    const data = await res.json();

    if (data.result !== 100) {
      console.error('OxaPay Withdraw error:', data.message);
      return NextResponse.json({ error: data.message || 'Withdrawal failed' }, { status: 400 });
    }

    // Success
    return NextResponse.json({ success: true, txId: data.trackId });
  } catch (error) {
    console.error('Admin OxaPay Withdraw Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
