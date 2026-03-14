import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Package from '@/models/Package';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await connectDB();
    const user = await User.findOne({ key: session.value });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { addressCity, trackingId, note, forwardAddress, weight, dimensions } = await req.json();

    if (!addressCity || !trackingId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newPackageData = {
      userId: user._id,
      trackingId: trackingId.trim(),
      note: note ? note.trim() : '',
      weight: weight || '',
      dimensions: dimensions || '',
      status: 'Pending',
      createdAt: new Date()
    };

    // Save forwarding address if provided
    if (forwardAddress && forwardAddress.street && forwardAddress.city) {
      newPackageData.forwardAddress = {
        name: (forwardAddress.name || '').trim(),
        street: forwardAddress.street.trim(),
        city: forwardAddress.city.trim(),
        state: (forwardAddress.state || '').trim(),
        zip: (forwardAddress.zip || '').trim(),
        country: (forwardAddress.country || '').trim()
      };
    }

    const newPackage = await Package.create(newPackageData);

    return NextResponse.json({ success: true, package: newPackage });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
