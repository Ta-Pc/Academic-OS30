import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/terms -> list terms for the current (seed/dev) user context
export async function GET() {
  try {
    // For now use first user + its degree (dev environment assumption)
    const user = await prisma.user.findFirst({ include: { degree: true } });
    if (!user) return NextResponse.json({ terms: [] });
    const terms = await prisma.term.findMany({ where: { degreeId: user.degreeId || undefined }, orderBy: { startDate: 'asc' } });
    return NextResponse.json({ terms });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/terms -> create a term (body: { title, startDate, endDate })
export async function POST(req: NextRequest) {
  try {
    const { title, startDate, endDate } = await req.json();
    if (!title || !startDate || !endDate) return NextResponse.json({ error: 'title,startDate,endDate required' }, { status: 400 });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return NextResponse.json({ error: 'invalid date range' }, { status: 400 });
    const user = await prisma.user.findFirst({ include: { degree: true } });
    if (!user || !user.degreeId) return NextResponse.json({ error: 'no user/degree available' }, { status: 400 });
    // overlap detection (same degree)
    const overlaps = await prisma.term.findMany({ where: { degreeId: user.degreeId, OR: [ { startDate: { lte: end }, endDate: { gte: start } } ] } });
    const term = await prisma.term.create({ data: { title, startDate: start, endDate: end, degreeId: user.degreeId, ownerId: user.id } });
    return NextResponse.json({ term, overlaps: overlaps.filter(o => o.id !== term.id) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
