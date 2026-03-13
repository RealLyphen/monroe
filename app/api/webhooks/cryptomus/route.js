import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const WALLETS_PATH = path.join(process.cwd(), 'data', 'wallets.json');

function loadWallets() {
  if (!fs.existsSync(WALLETS_PATH)) return {};
  return JSON.parse(fs.readFileSync(WALLETS_PATH, 'utf8'));
}

function saveWallets(data) {
  fs.writeFileSync(WALLETS_PATH, JSON.stringify(data, null, 2));
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    const PAYMENT_KEY = process.env.CRYPTOMUS_PAYMENT_KEY || 'dummy_key';

    // Verify Signature
    // For callbacks, Cryptomus sends `sign` in the body payload
    const { sign, ...dataWithoutSign } = payload;
    
    // Sort keys alphabetically and stringify values to generate hash payload, 
    // OR simply JSON-stringify the payload without the sign. 
    // Actually, Cryptomus callback signature verification:
    // md5(base64(json_encode(payload_without_sign)) + API_KEY)
    
    const base64Body = Buffer.from(JSON.stringify(dataWithoutSign)).toString('base64');
    const expectedSign = crypto.createHash('md5').update(base64Body + PAYMENT_KEY).digest('hex');

    if (sign !== expectedSign) {
      console.error('Cryptomus webhook invalid signature', { sign, expectedSign });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process only successful payments
    if (payload.status === 'paid' || payload.status === 'paid_over') {
      
      // order_id is formatted as TOPUP-{username}-{timestamp}
      const orderIdParts = payload.order_id.split('-');
      if (orderIdParts.length >= 3 && orderIdParts[0] === 'TOPUP') {
        const username = orderIdParts[1];
        const amount = parseFloat(payload.amount); // Fiat amount is usually what we care about, or payment_amount USD
        const finalAmount = payload.is_final ? amount : amount; 
        
        const wallets = loadWallets();
        if (!wallets[username]) {
          wallets[username] = { balance: 0, transactions: [] };
        }

        // Avoid duplicate processing by checking transaction ID
        const txId = `CRYPTO-${payload.uuid}`;
        const alreadyProcessed = wallets[username].transactions.some(t => t.id === txId);

        if (!alreadyProcessed) {
          wallets[username].balance += finalAmount;
          wallets[username].transactions.unshift({
            id: txId,
            type: 'credit',
            amount: finalAmount,
            note: `Cryptomus Top-Up (${payload.currency})`,
            createdAt: new Date().toISOString()
          });

          saveWallets(wallets);
          console.log(`Processed Cryptomus top-up of $${finalAmount} for user ${username}`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Cryptomus Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
