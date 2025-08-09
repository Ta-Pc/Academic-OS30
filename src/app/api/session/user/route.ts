import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Mock session: pick first user, or create one if none exists (dev-only convenience)
    let user = await prisma.user.findFirst({ select: { id: true, email: true, name: true } });
    if (!user) {
      user = await prisma.user.create({ data: { email: 'default@example.com', name: 'Default User' } });
    }
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}


