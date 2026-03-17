import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Package from '@/models/Package';
import Notification from '@/models/Notification';
import Wallet from '@/models/Wallet';

export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, photoUrl, forwardTrackingId, weight, dimensions, deductionAmount } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await connectDB();
    const pkg = await Package.findById(id).populate('userId');
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    pkg.status = status;

    if (photoUrl) pkg.photoUrl = photoUrl;
    if (weight !== undefined) pkg.weight = weight;
    if (dimensions) pkg.dimensions = dimensions;

    if (forwardTrackingId) {
      pkg.forwardTrackingId = forwardTrackingId;
      pkg.forwardedAt = new Date(); // Set forwardedAt when forwardTrackingId is provided
    }

    await pkg.save();

    if (status === 'Forwarded' && deductionAmount && parseFloat(deductionAmount) > 0) {
      let wallet = await Wallet.findOne({ userId: pkg.userId._id });
      if (!wallet) {
        wallet = new Wallet({ userId: pkg.userId._id, balance: 0, transactions: [] });
      }
      wallet.balance -= parseFloat(deductionAmount);
      wallet.transactions.unshift({
        id: `TXN-${Date.now()}`,
        type: 'debit',
        amount: parseFloat(deductionAmount),
        note: `Shipping cost for package ${pkg.trackingId}`,
        createdAt: new Date()
      });
      await wallet.save();
    }

    // Auto-notify the user when status changes
    let notifMessage = `Your package ${pkg.trackingId} has been marked as ${status}.`;
    if (status === 'Received' && photoUrl) {
      notifMessage = `📦 Your package reached our facility! Photo attached to details.`;
    }
    if (status === 'Forwarded' && forwardTrackingId) {
      notifMessage = `🚀 Your package has been shipped! Outgoing tracking: ${forwardTrackingId}`;
    }
    if (status === 'Completed') {
      notifMessage = `✅ Your order has been completed! Thank you for using Monroe.`;
    }

    await Notification.create({
      target: pkg.userId.username,
      title: 'Package Update',
      message: notifMessage,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, package: pkg });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/packages — consolidate packages
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, packageIds, consolidatedTrackingId } = await req.json();

    if (action === 'CONSOLIDATE') {
      if (!packageIds || packageIds.length < 2) {
        return NextResponse.json({ error: 'Need at least 2 packages to consolidate' }, { status: 400 });
      }

      await connectDB();
      const targetPkgs = await Package.find({ _id: { $in: packageIds } }).populate('userId');
      
      if (targetPkgs.length < 2) {
        return NextResponse.json({ error: 'Packages not found' }, { status: 404 });
      }

      // Create a consolidated package
      const firstPkg = targetPkgs[0];
      const newPkg = await Package.create({
        userId: firstPkg.userId._id,
        trackingId: consolidatedTrackingId || 'CONSOLIDATED-' + Date.now().toString().slice(-6),
        note: `Consolidated from: ${targetPkgs.map(p => p.trackingId).join(', ')}`,
        status: 'Received',
        isConsolidated: true,
        sourcePackages: packageIds,
        forwardAddress: firstPkg.forwardAddress || null,
        weight: targetPkgs.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0).toString(),
        photoUrl: firstPkg.photoUrl || null,
        createdAt: new Date()
      });

      // Mark originals as consolidated
      await Package.updateMany(
        { _id: { $in: packageIds } },
        { $set: { status: 'Consolidated', consolidatedInto: newPkg._id.toString() } }
      );

      // Notify user
      await Notification.create({
        target: firstPkg.userId.username,
        title: 'Packages Consolidated',
        message: `📦 ${packageIds.length} packages have been merged into a single shipment.`,
        createdAt: new Date()
      });

      return NextResponse.json({ success: true, package: newPkg });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
