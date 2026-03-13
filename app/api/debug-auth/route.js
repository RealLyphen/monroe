import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const debugInfo = {};

  try {
    debugInfo.cwd = process.cwd();
    debugInfo.dirname = __dirname;
    const dataPath = path.join(process.cwd(), 'data');
    debugInfo.dataPath = dataPath;
    debugInfo.dataExists = fs.existsSync(dataPath);
    
    if (debugInfo.dataExists) {
      debugInfo.dataFiles = fs.readdirSync(dataPath);
    }
    
    const keysPath = path.join(dataPath, 'keys.json');
    debugInfo.keysExists = fs.existsSync(keysPath);
    
    if (debugInfo.keysExists) {
      const keysContent = fs.readFileSync(keysPath, 'utf8');
      debugInfo.keysContentRaw = keysContent;
      try {
        debugInfo.parsedKeys = JSON.parse(keysContent);
      } catch (e) {
        debugInfo.parseError = e.message;
      }
    }
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    debugInfo.globalError = error.message;
    return NextResponse.json(debugInfo, { status: 500 });
  }
}
