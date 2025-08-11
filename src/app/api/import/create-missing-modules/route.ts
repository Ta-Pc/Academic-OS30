import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
  const { codes } = await req.json();
  if (!Array.isArray(codes)) return NextResponse.json({ error: 'codes array required' }, { status: 400 });
    let created = 0;
    for (const raw of codes as string[]) {
      const code = String(raw || '').trim();
      if (!code) continue;
  const exists = await prisma.module.findFirst({ where: { code } });
      if (!exists) {
  await prisma.module.create({ data: { code, title: code, creditHours: 12 } as any });
        created++;
      }
    }
    return NextResponse.json({ created });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


