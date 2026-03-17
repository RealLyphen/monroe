import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Package from '@/models/Package';
import Address from '@/models/Address';
import Notification from '@/models/Notification';
import Wallet from '@/models/Wallet';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const isAdmin = session.value === 'ADMIN-01';

    if (isAdmin) {
      const [allPackages, allAddresses, allUsers, allNotifications, allWallets] = await Promise.all([
        Package.find().populate('userId', 'username').lean(),
        Address.find().lean(),
        User.find().lean(),
        Notification.find({ target: { $in: ['ALL', 'ADMIN'] } }).lean(),
        Wallet.find().populate('userId', 'username').lean()
      ]);

      // Map packages to match expected frontend structure (injecting username)
      const mappedPackages = allPackages.map(p => ({
        ...p,
        id: p._id.toString(), // For compatibility with frontend if it uses .id
        username: p.userId?.username || 'Unknown'
      }));

      // Map wallets to { username: { balance, transactions } }
      const walletsMap = {};
      allWallets.forEach(w => {
        if (w.userId && w.userId.username) {
          walletsMap[w.userId.username] = { balance: w.balance, transactions: w.transactions };
        }
      });

      return NextResponse.json({
        packages: mappedPackages,
        addresses: allAddresses,
        users: allUsers,
        notifications: allNotifications,
        wallets: walletsMap
      });
    }

    // Normal user sees only their stuff
    const user = await User.findOne({ key: session.value });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const username = user.username;
    const [userPackages, activeAddresses, userNotifications, userWallet] = await Promise.all([
      Package.find({ userId: user._id }).lean(),
      Address.find({ active: true }).lean(),
      Notification.find({ target: { $in: ['ALL', username] } }).sort({ createdAt: -1 }).lean(),
      Wallet.findOne({ userId: user._id }).lean()
    ]);

    return NextResponse.json({
      packages: userPackages.map(p => ({ ...p, id: p._id.toString(), username: user.username })),
      addresses: activeAddresses,
      notifications: userNotifications,
      wallet: userWallet || { balance: 0, transactions: [] },
      savedAddresses: user.savedAddresses || []
    });

  } catch (error) {
    console.error('Error in /api/dashboard/data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
