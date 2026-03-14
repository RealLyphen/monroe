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

    // Cryptomus API Credentials
    const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID || 'dummy_merchant';
    const PAYMENT_KEY = process.env.CRYPTOMUS_PAYMENT_KEY || 'dummy_key';

    // Build Payload for Cryptomus
    const orderId = `TOPUP-${user.username}-${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/cryptomus`;

    // ── Sandbox Mode ──
    if (process.env.CRYPTOMUS_SANDBOX === 'true') {
      console.log('CRYPTOMUS SANDBOX ENABLED: Simulating payment success...');
      
      // Manually trigger the webhook ourselves with a mock payload
      const mockPayload = {
        uuid: `mock-${Date.now()}`,
        order_id: orderId,
        amount: numAmount.toString(),
        currency: 'USD',
        status: 'paid',
        is_final: true,
      };

      // Sign the mock payload just like Cryptomus would
      const mockBase64 = Buffer.from(JSON.stringify(mockPayload)).toString('base64');
      mockPayload.sign = crypto.createHash('md5').update(mockBase64 + PAYMENT_KEY).digest('hex');

      // Hit our own webhook in the background
      fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPayload)
      }).catch(err => console.error('Sandbox webhook fail:', err));

      // Redirect user back immediately
      return NextResponse.json({ url: returnUrl });
    }
    // ── End Sandbox ──

    const payload = {
      amount: numAmount.toString(),
      currency: 'USD',
      order_id: orderId,
      url_return: returnUrl,
      url_callback: callbackUrl,
      is_payment_multiple: true,
      lifetime: 3600 // 1 hour
    };

    const payloadJson = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadJson).toString('base64');
    const sign = crypto.createHash('md5').update(base64Payload + PAYMENT_KEY).digest('hex');

    const res = await fetch('https://api.cryptomus.com/v1/payment', {
      method: 'POST',
      headers: {
        'merchant': MERCHANT_ID,
        'sign': sign,
        'Content-Type': 'application/json'
      },
      body: payloadJson
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Cryptomus API Error:', errorText);
      return NextResponse.json({ error: 'Failed to generate payment url' }, { status: 500 });
    }

    const result = await res.json();
    
    // Result contains result.url which is the payment page
    return NextResponse.json({ url: result.result.url });

  } catch (error) {
    console.error('Topup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
