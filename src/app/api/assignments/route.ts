import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        module: {
          select: { code: true, title: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
