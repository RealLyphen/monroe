import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Package from '@/models/Package';
import Wallet from '@/models/Wallet';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let totalRevenue = 0;

    // Use wallet debits as reliable "Revenue" indicator
    const walletsThisMonth = await Wallet.find({ 
      'transactions.createdAt': { $gte: startOfMonth, $lte: endOfMonth }
    });

    for (const wallet of walletsThisMonth) {
      if (wallet.transactions && wallet.transactions.length > 0) {
         for (const t of wallet.transactions) {
            // Count wallet debits as earnings (when users pay for a service)
            const transactionDate = new Date(t.createdAt);
            if (t.type === 'debit' && transactionDate >= startOfMonth && transactionDate <= endOfMonth) {
               totalRevenue += parseFloat(t.amount) || 0;
            }
         }
      }
    }

    // Alternative logic if there's an issue with wallets, fall back to DB operations
    // Though checking Wallet explicitly covers deductions like "Shipping cost for package ..."

    return NextResponse.json({ success: true, totalRevenue });
  } catch (e) {
    console.error('Analytics GET Error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
