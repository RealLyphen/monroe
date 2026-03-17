import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId, forwardAddress } = await req.json();

    if (!packageId || !forwardAddress || !forwardAddress.name || !forwardAddress.street || !forwardAddress.city) {
      return NextResponse.json({ error: 'Missing package ID or complete address details' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ key: session.value });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet || wallet.balance <= 0) {
      return NextResponse.json({ error: 'Insufficient balance. You cannot set up a forwarding request with zero balance.' }, { status: 403 });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      {
        $set: {
          forwardAddress: {
            name: forwardAddress.name.trim(),
            street: forwardAddress.street.trim(),
            city: forwardAddress.city.trim(),
            state: (forwardAddress.state || '').trim(),
            zip: (forwardAddress.zip || '').trim(),
            country: (forwardAddress.country || '').trim()
          }
        }
      },
      { new: true }
    );

    if (!updatedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, package: updatedPackage });
  } catch (error) {
    console.error('API /packages/forward Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
