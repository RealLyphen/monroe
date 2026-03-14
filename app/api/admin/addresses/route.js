import connectDB from '@/lib/db';
import Address from '@/models/Address';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, address } = await req.json();

    await connectDB();

    if (action === 'ADD') {
      if (!address.name || !address.street || !address.city) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }
      await Address.create({
        name: address.name,
        street: address.street,
        city: address.city,
        active: true
      });
      const allAddresses = await Address.find().lean();
      return NextResponse.json({ success: true, addresses: allAddresses });
    }

    if (action === 'TOGGLE') {
      const addr = await Address.findById(address._id || address.id);
      if (addr) {
        addr.active = !addr.active;
        await addr.save();
        const allAddresses = await Address.find().lean();
        return NextResponse.json({ success: true, addresses: allAddresses });
      }
    }

    if (action === 'EDIT') {
      const id = address._id || address.id;
      if (!address.name || !address.street || !address.city) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }
      await Address.findByIdAndUpdate(id, {
        name: address.name,
        street: address.street,
        city: address.city
      });
      const allAddresses = await Address.find().lean();
      return NextResponse.json({ success: true, addresses: allAddresses });
    }

    if (action === 'DELETE') {
      const id = address._id || address.id;
      await Address.findByIdAndDelete(id);
      const allAddresses = await Address.find().lean();
      return NextResponse.json({ success: true, addresses: allAddresses });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
