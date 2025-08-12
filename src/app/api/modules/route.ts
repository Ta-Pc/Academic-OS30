import { NextResponse, NextRequest } from 'next/server';
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, title, creditHours, targetMark, department, status } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json({ error: 'Module code is required' }, { status: 400 });
    }

    // Use code as title if title is not provided
    const finalTitle = title?.trim() || code.trim();

    // Check if module with this code already exists
    const existingModule = await prisma.module.findFirst({
      where: { code: code.trim() }
    });

    if (existingModule) {
      return NextResponse.json({ error: 'Module with this code already exists' }, { status: 400 });
    }

    // Create the module
    const module = await prisma.module.create({
      data: {
        code: code.trim(),
        title: finalTitle,
        creditHours: Number(creditHours) || 12,
        targetMark: targetMark ? Number(targetMark) : null,
        department: department?.trim() || null,
        status: status || 'ACTIVE'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: module,
      message: 'Module created successfully'
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create module';
    console.error('Module creation error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

