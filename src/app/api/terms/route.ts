import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/terms -> list all terms
export async function GET() {
  try {
    const terms = await prisma.term.findMany({ orderBy: { startDate: 'asc' } });
    return NextResponse.json({ terms });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/terms -> create a term (body: { title, startDate, endDate, degreeId })
export async function POST(req: NextRequest) {
  try {
    const { title, startDate, endDate, degreeId } = await req.json();
    if (!title || !startDate || !endDate) return NextResponse.json({ error: 'title,startDate,endDate required' }, { status: 400 });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return NextResponse.json({ error: 'invalid date range' }, { status: 400 });
    
    // Use first degree if not specified
    let targetDegreeId = degreeId;
    if (!targetDegreeId) {
      const firstDegree = await prisma.degree.findFirst();
      if (!firstDegree) return NextResponse.json({ error: 'no degrees available' }, { status: 400 });
      targetDegreeId = firstDegree.id;
    }
    
    // overlap detection (same degree)
    const overlaps = await prisma.term.findMany({ where: { degreeId: targetDegreeId, OR: [ { startDate: { lte: end }, endDate: { gte: start } } ] } });
    const term = await prisma.term.create({ data: { title, startDate: start, endDate: end, degreeId: targetDegreeId } });
    return NextResponse.json({ term, overlaps: overlaps.filter(o => o.id !== term.id) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
