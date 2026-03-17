import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || !session.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, address } = await req.json();

    if (!address || !address.name || !address.street || !address.city) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ key: session.value });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'ADD') {
      // Initialize if null somehow, though schema defaults usually handle this
      if (!user.savedAddresses) user.savedAddresses = [];
      
      user.savedAddresses.push({
        name: address.name.trim(),
        street: address.street.trim(),
        city: address.city.trim(),
        state: (address.state || '').trim(),
        zip: (address.zip || '').trim(),
        country: (address.country || '').trim()
      });
      await user.save();
      return NextResponse.json({ success: true, savedAddresses: user.savedAddresses });
    } else if (action === 'DELETE') {
      // Identify address to delete. This can be complex without _id for subdocuments,
      // but matching by name and street is usually unique enough for an address book.
      if (user.savedAddresses && user.savedAddresses.length > 0) {
        user.savedAddresses = user.savedAddresses.filter(a => 
          a.name !== address.name || a.street !== address.street
        );
        await user.save();
      }
      return NextResponse.json({ success: true, savedAddresses: user.savedAddresses });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in /api/user/addresses:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
