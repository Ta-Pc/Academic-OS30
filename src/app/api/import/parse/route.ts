import { NextRequest, NextResponse } from 'next/server';
import { parseCsv } from '@/lib/csv';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const parsed = parseCsv(text);
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'parse failed' }, { status: 400 });
  }
}


