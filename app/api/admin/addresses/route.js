import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADDRESSES_PATH = path.join(process.cwd(), 'data', 'addresses.json');

function loadJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; } }
function saveJson(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('monroe_session');

    if (!session || session.value !== 'ADMIN-01') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, address } = await req.json();

    const addresses = loadJson(ADDRESSES_PATH);

    if (action === 'ADD') {
      if (!address.name || !address.street || !address.city) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }
      addresses.push({
        id: `ADR-${Math.floor(100+Math.random()*900)}`,
        ...address,
        active: true
      });
      saveJson(ADDRESSES_PATH, addresses);
      return NextResponse.json({ success: true, addresses });
    }

    if (action === 'TOGGLE') {
      const idx = addresses.findIndex(a => a.id === address.id);
      if (idx > -1) {
        addresses[idx].active = !addresses[idx].active;
        saveJson(ADDRESSES_PATH, addresses);
        return NextResponse.json({ success: true, addresses });
      }
    }

    if (action === 'DELETE') {
      const newAddresses = addresses.filter(a => a.id !== address.id);
      saveJson(ADDRESSES_PATH, newAddresses);
      return NextResponse.json({ success: true, addresses: newAddresses });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
