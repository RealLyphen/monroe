import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Package from '@/models/Package';

export async function POST(req) {
  try {
    const { packageId, forwardAddress } = await req.json();

    if (!packageId || !forwardAddress || !forwardAddress.name || !forwardAddress.street || !forwardAddress.city) {
      return NextResponse.json({ error: 'Missing package ID or complete address details' }, { status: 400 });
    }

    await connectDB();

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
