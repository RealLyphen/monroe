import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    await connectDB();
    const Settings = (await import('@/models/Settings')).default;
    let settings = await Settings.findOne({ globalId: 'system_settings' });
    const MERCHANT_KEY = settings ? settings.oxapayMerchantId : (process.env.OXAPAY_MERCHANT_KEY || 'dummy_merchant');

    // Verify Signature
    const signature = req.headers.get('hmac');
    const expectedSign = crypto.createHmac('sha512', MERCHANT_KEY).update(rawBody).digest('hex');

    if (signature !== expectedSign) {
      console.error('OxaPay webhook invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process only successful payments
    if (payload.status === 'Paid') {
      
      const orderIdParts = payload.orderId.split('-');
      if (orderIdParts.length >= 3 && orderIdParts[0] === 'TOPUP') {
        const username = orderIdParts[1];
        // Ensure final amount is read correctly. OxaPay uses "payAmount" / "amount" sometimes, we requested in USD.
        const finalAmount = parseFloat(payload.amount);
        
        await connectDB();
        const user = await User.findOne({ username });
        if (user) {
          let wallet = await Wallet.findOne({ userId: user._id });
          if (!wallet) {
            wallet = new Wallet({ userId: user._id, balance: 0, transactions: [] });
          }

          // Avoid duplicate processing by checking transaction ID
          const txId = `OXA-${payload.trackId || Date.now()}`;
          const alreadyProcessed = wallet.transactions.some(t => t.id === txId);

          if (!alreadyProcessed) {
            wallet.balance += finalAmount;
            wallet.transactions.unshift({
              id: txId,
              type: 'credit',
              amount: finalAmount,
              note: `OxaPay Top-Up (USD - ${payload.payCoin || 'Crypto'})`,
              createdAt: new Date()
            });

            await wallet.save();
            console.log(`Processed OxaPay top-up of $${finalAmount} for user ${username}`);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('OxaPay Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
