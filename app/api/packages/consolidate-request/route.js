import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageIds } = await req.json();

    if (!packageIds || packageIds.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 packages to request consolidation' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ key: session.value });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify user owns all these packages and their status allows consolidation
    const targetPkgs = await Package.find({
      _id: { $in: packageIds },
      userId: user._id
    });

    if (targetPkgs.length !== packageIds.length) {
      return NextResponse.json({ error: 'One or more packages not found or unauthorized' }, { status: 404 });
    }
    
    // Check if they are eligible for consolidation
    const invalidPkgs = targetPkgs.filter(p => !['Pending', 'Received', 'Consolidation Requested'].includes(p.status));
    if (invalidPkgs.length > 0) {
      return NextResponse.json({ error: 'Some packages cannot be consolidated due to their current status.' }, { status: 400 });
    }

    // Check all packages are at the same address
    const cities = [...new Set(targetPkgs.map(p => (p.addressCity || '').toLowerCase().trim()))];
    if (cities.length > 1) {
      return NextResponse.json({ error: 'All packages must be at the same address to consolidate.' }, { status: 400 });
    }

    // Update statuses to 'Consolidation Requested'
    await Package.updateMany(
      { _id: { $in: packageIds } },
      { $set: { status: 'Consolidation Requested' } }
    );

    // Notify Admin
    await Notification.create({
      target: 'ADMIN-01',
      title: 'Consolidation Request',
      message: `User ${user.username} requested consolidation for ${packageIds.length} packages.`,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, message: 'Consolidation requested successfully' });
  } catch (error) {
    console.error('API /packages/consolidate-request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
