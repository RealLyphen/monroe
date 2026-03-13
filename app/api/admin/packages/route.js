import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PACKAGES_PATH = path.join(process.cwd(), 'data', 'packages.json');
const NOTIFS_PATH = path.join(process.cwd(), 'data', 'notifications.json');

function loadJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; } }
function saveJson(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, photoUrl, forwardTrackingId, weight, dimensions } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const packages = loadJson(PACKAGES_PATH);
    const pkgIndex = packages.findIndex(p => p.id === id);

    if (pkgIndex === -1) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    const pkg = packages[pkgIndex];
    pkg.status = status;

    // Save photo URL when marking as Received
    if (photoUrl) {
      pkg.photoUrl = photoUrl;
    }

    // Save weight and dimensions
    if (weight !== undefined) {
      pkg.weight = weight;
    }
    if (dimensions) {
      pkg.dimensions = dimensions;
    }

    // Save forward tracking ID when marking as Forwarded
    if (forwardTrackingId) {
      pkg.forwardTrackingId = forwardTrackingId;
      pkg.forwardedAt = new Date().toISOString();
    }

    saveJson(PACKAGES_PATH, packages);

    // Auto-notify the user when status changes
    const notifications = loadJson(NOTIFS_PATH);
    let notifMessage = `Your package ${pkg.id} has been marked as ${status}.`;
    if (status === 'Received' && photoUrl) {
      notifMessage = `📦 Your package ${pkg.id} has been received at our facility! Photo attached to your package details.`;
    }
    if (status === 'Forwarded' && forwardTrackingId) {
      notifMessage = `🚀 Your package ${pkg.id} has been shipped out! Outgoing tracking: ${forwardTrackingId}`;
    }
    if (status === 'Completed') {
      notifMessage = `✅ Your package ${pkg.id} order has been completed! Thank you for using Monroe.`;
    }

    notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      target: pkg.username,
      title: 'Package Update',
      message: notifMessage,
      createdAt: new Date().toISOString()
    });
    saveJson(NOTIFS_PATH, notifications);

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

      const packages = loadJson(PACKAGES_PATH);
      const targetPkgs = packages.filter(p => packageIds.includes(p.id));
      
      if (targetPkgs.length < 2) {
        return NextResponse.json({ error: 'Packages not found' }, { status: 404 });
      }

      // Create a consolidated package
      const firstPkg = targetPkgs[0];
      const consolidatedPkg = {
        id: `PKG-C${Math.floor(10000 + Math.random() * 90000)}`,
        userId: firstPkg.userId,
        username: firstPkg.username,
        addressId: firstPkg.addressId,
        addressCity: firstPkg.addressCity,
        trackingId: consolidatedTrackingId || targetPkgs.map(p => p.trackingId).join(', '),
        note: `Consolidated from: ${packageIds.join(', ')}`,
        status: 'Received',
        isConsolidated: true,
        sourcePackages: packageIds,
        forwardAddress: firstPkg.forwardAddress || null,
        weight: targetPkgs.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0).toString(),
        photoUrl: firstPkg.photoUrl || null,
        createdAt: new Date().toISOString()
      };

      // Mark originals as consolidated
      for (const pkg of targetPkgs) {
        pkg.status = 'Consolidated';
        pkg.consolidatedInto = consolidatedPkg.id;
      }

      packages.unshift(consolidatedPkg);
      saveJson(PACKAGES_PATH, packages);

      // Notify user
      const notifications = loadJson(NOTIFS_PATH);
      notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        target: firstPkg.username,
        title: 'Packages Consolidated',
        message: `📦 ${packageIds.length} packages have been merged into ${consolidatedPkg.id} for a single shipment.`,
        createdAt: new Date().toISOString()
      });
      saveJson(NOTIFS_PATH, notifications);

      return NextResponse.json({ success: true, package: consolidatedPkg });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
