import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['READ', 'STUDY', 'PRACTICE', 'REVIEW', 'ADMIN']),
  dueDate: z.string().transform((str) => new Date(str)),
  moduleId: z.string().min(1, 'Module ID is required'),
  source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const { title, type, dueDate, moduleId, source } = parsed.data;

    // Verify module exists
    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const task = await prisma.tacticalTask.create({
      data: {
        title,
        type: type.toUpperCase() as 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN',
        dueDate,
        moduleId,
        source,
        status: 'PENDING',
      },
      include: {
        module: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (err) {
    console.error('Error creating tactical task:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const moduleId = url.searchParams.get('moduleId');
    
    const where = moduleId ? { moduleId } : {};
    
    const tasks = await prisma.tacticalTask.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ data: tasks });
  } catch (err) {
    console.error('Error fetching tactical tasks:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
