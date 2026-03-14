import connectDB from '@/lib/db';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

// GET /api/admin/wallet?username=xxx (admin gets any, user gets own)
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');
    if (!session || !session.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const isAdmin = session.value === 'ADMIN-01';

    if (isAdmin) {
      const { searchParams } = new URL(req.url);
      const username = searchParams.get('username');
      
      if (username) {
        const user = await User.findOne({ username });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const wallet = await Wallet.findOne({ userId: user._id }).lean();
        return NextResponse.json({ wallet: wallet || { balance: 0, transactions: [] } });
      }

      // If no username, return all wallets mapped by username
      const allWallets = await Wallet.find().populate('userId', 'username').lean();
      const walletsMap = {};
      allWallets.forEach(w => {
        if (w.userId?.username) walletsMap[w.userId.username] = { balance: w.balance, transactions: w.transactions };
      });
      return NextResponse.json({ wallets: walletsMap });
    }

    // Normal user — get their own wallet
    const user = await User.findOne({ key: session.value });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wallet = await Wallet.findOne({ userId: user._id }).lean();
    return NextResponse.json({ wallet: wallet || { balance: 0, transactions: [] } });
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

    await connectDB();
    const user = await User.findOne({ username });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({ userId: user._id, balance: 0, transactions: [] });
    }

    const numAmount = parseFloat(amount);
    if (type === 'credit') {
      wallet.balance += numAmount;
    } else if (type === 'debit') {
      wallet.balance -= numAmount;
    }

    wallet.transactions.unshift({
      id: `TXN-${Date.now()}`,
      type,
      amount: numAmount,
      note: note || '',
      createdAt: new Date()
    });

    await wallet.save();
    return NextResponse.json({ success: true, wallet });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
