import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const modules = await prisma.module.findMany({ orderBy: { code: 'asc' } });
    return NextResponse.json({ modules });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

