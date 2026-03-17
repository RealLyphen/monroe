import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import User from '@/models/User';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    await connectDB();
    
    // Auth check: either statically logged in as Owner or dynamically
    let isAdmin = false;
    if (session && session.value === 'ADMIN-01') {
      isAdmin = true;
    } else if (session && session.value) {
      const user = await User.findOne({ key: session.value });
      if (user && user.role === 'admin') isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let settings = await Settings.findOne({ globalId: 'system_settings' });
    if (!settings) {
      settings = await Settings.create({ 
        globalId: 'system_settings',
        ownerKey: 'ADMIN-01',
        oxapayMerchantId: process.env.OXAPAY_MERCHANT_KEY || 'dummy_merchant'
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (e) {
    console.error('Settings GET Error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    await connectDB();
    
    // Auth check for Owner
    let isAdmin = false;
    if (session && session.value === 'ADMIN-01') {
      isAdmin = true;
    } else if (session && session.value) {
      const user = await User.findOne({ key: session.value });
      if (user && user.role === 'admin') isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ownerKey, oxapayMerchantId } = await req.json();

    const updateAuth = { $set: {} };
    if (ownerKey && ownerKey.trim()) updateAuth.$set.ownerKey = ownerKey.trim();
    if (oxapayMerchantId && oxapayMerchantId.trim()) updateAuth.$set.oxapayMerchantId = oxapayMerchantId.trim();

    if (Object.keys(updateAuth.$set).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      { globalId: 'system_settings' },
      updateAuth,
      { new: true, upsert: true } // Upsert if setting doesn't exist
    );

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (e) {
    console.error('Settings POST Error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
