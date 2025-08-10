import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = (await prisma.user.findFirst({ select: { id: true } }))?.id;
    if (!userId) return NextResponse.json({ modules: [] });
    const modules = await prisma.module.findMany({ where: { ownerId: userId }, orderBy: { code: 'asc' } });
    return NextResponse.json({ modules });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

