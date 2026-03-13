import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function loadPackages() {
  const filePath = path.join(process.cwd(), 'data', 'packages.json');
  if (!fs.existsSync(filePath)) return { packages: [] };
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function savePackages(data) {
  const filePath = path.join(process.cwd(), 'data', 'packages.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function POST(req) {
  try {
    const { packageId, forwardAddress } = await req.json();

    if (!packageId || !forwardAddress || !forwardAddress.name || !forwardAddress.street || !forwardAddress.city) {
      return NextResponse.json({ error: 'Missing package ID or complete address details' }, { status: 400 });
    }

    const data = loadPackages();
    const pkgIndex = data.packages.findIndex(p => p.id === packageId);
    
    if (pkgIndex === -1) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Assign the forwarding address to the package
    data.packages[pkgIndex] = {
      ...data.packages[pkgIndex],
      forwardAddress: {
        name: forwardAddress.name.trim(),
        street: forwardAddress.street.trim(),
        city: forwardAddress.city.trim()
      }
    };

    savePackages(data);

    return NextResponse.json({ success: true, package: data.packages[pkgIndex] });
  } catch (error) {
    console.error('API /packages/forward Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
