import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value || session.value === 'ADMIN-01') {
      return NextResponse.json({ error: 'Unauthorized or invalid user type' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ key: session.value });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 1) {
      return NextResponse.json({ error: 'Invalid amount. Minimum $1 required.' }, { status: 400 });
    }

    // OxaPay API Credentials
    let MERCHANT_KEY = process.env.OXAPAY_MERCHANT_KEY;
    if (!MERCHANT_KEY || MERCHANT_KEY === 'dummy_merchant') {
      try {
        const fs = require('fs');
        const path = require('path');
        const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
        const match = envContent.match(/OXAPAY_MERCHANT_KEY=(.*)/);
        if (match) MERCHANT_KEY = match[1].replace(/[\r\n]/g, '').trim();
      } catch (e) {
        console.error('Failed to read .env file', e);
      }
    }
    if (!MERCHANT_KEY) MERCHANT_KEY = 'dummy_merchant';

    // Build Payload for OxaPay
    const orderId = `TOPUP-${user.username}-${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/oxapay`;

    const payload = {
      merchant: MERCHANT_KEY,
      amount: numAmount, // OxaPay expects numeric or stringified float
      currency: 'USD',
      lifeTime: 60,
      feePaidByPayer: 1, // Optional: Let user pay network fees
      underPaidCover: 0,
      callbackUrl,
      returnUrl,
      orderId,
      description: `Monroe Wallet Top-up for ${user.username}`
    };

    const res = await fetch('https://api.oxapay.com/merchants/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OxaPay API Error:', errorText);
      return NextResponse.json({ error: 'Failed to generate payment url' }, { status: 500 });
    }

    const result = await res.json();
    
    if (result.result !== 100) {
      console.error('OxaPay Error response:', result);
      return NextResponse.json({ error: result.message || 'Failed to generate invoice' }, { status: 500 });
    }
    
    return NextResponse.json({ url: result.payLink });

  } catch (error) {
    console.error('Topup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
