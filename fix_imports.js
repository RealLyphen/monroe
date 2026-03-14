const fs = require('fs');
const files = [
  'app/api/chat/route.js',
  'app/api/admin/notify/route.js',
  'app/api/admin/addresses/route.js',
  'app/api/admin/wallet/route.js',
  'app/api/dashboard/data/route.js',
  'app/api/packages/route.js',
  'app/api/wallet/topup/route.js',
  'app/api/reviews/route.js'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("from 'next/headers'")) {
    content = "import { cookies } from 'next/headers';\n" + content;
  }
  if (!content.includes("from 'next/server'")) {
    content = "import { NextResponse } from 'next/server';\n" + content;
  }
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
