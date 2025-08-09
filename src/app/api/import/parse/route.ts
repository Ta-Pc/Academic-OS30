import { NextRequest, NextResponse } from 'next/server';
import { parseCsv } from '@/lib/csv';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const parsed = parseCsv(text);
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'parse failed' }, { status: 400 });
  }
}


