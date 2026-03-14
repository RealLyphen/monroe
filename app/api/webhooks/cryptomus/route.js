import connectDB from '@/lib/db';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    const PAYMENT_KEY = process.env.CRYPTOMUS_PAYMENT_KEY || 'dummy_key';

    // Verify Signature
    const { sign, ...dataWithoutSign } = payload;
    const base64Body = Buffer.from(JSON.stringify(dataWithoutSign)).toString('base64');
    const expectedSign = crypto.createHash('md5').update(base64Body + PAYMENT_KEY).digest('hex');

    if (sign !== expectedSign) {
      console.error('Cryptomus webhook invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process only successful payments
    if (payload.status === 'paid' || payload.status === 'paid_over') {
      
      const orderIdParts = payload.order_id.split('-');
      if (orderIdParts.length >= 3 && orderIdParts[0] === 'TOPUP') {
        const username = orderIdParts[1];
        const finalAmount = parseFloat(payload.amount);
        
        await connectDB();
        const user = await User.findOne({ username });
        if (user) {
          let wallet = await Wallet.findOne({ userId: user._id });
          if (!wallet) {
            wallet = new Wallet({ userId: user._id, balance: 0, transactions: [] });
          }

          // Avoid duplicate processing by checking transaction ID
          const txId = `CRYPTO-${payload.uuid}`;
          const alreadyProcessed = wallet.transactions.some(t => t.id === txId);

          if (!alreadyProcessed) {
            wallet.balance += finalAmount;
            wallet.transactions.unshift({
              id: txId,
              type: 'credit',
              amount: finalAmount,
              note: `Cryptomus Top-Up (${payload.currency})`,
              createdAt: new Date()
            });

            await wallet.save();
            console.log(`Processed Cryptomus top-up of $${finalAmount} for user ${username}`);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Cryptomus Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
