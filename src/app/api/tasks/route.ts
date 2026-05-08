import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  areaId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  deadline: z.string().datetime().optional(),
});

// GET /api/tasks?areaId=xxx — List tasks for an area
export async function GET(req: Request) {
  const auth = getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get('areaId');

  if (!areaId) {
    return NextResponse.json({ error: 'areaId is required' }, { status: 400 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { areaId },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        area: { select: { id: true, name: true } },
      },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Fetch Tasks Error:', error);
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 });
  }
}

// POST /api/tasks — Create a new task (MANAGER/PROFESSOR only)
export async function POST(req: Request) {
  const auth = getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only managers and professors can create tasks
  if (!['MANAGER', 'PROFESSOR'].includes(auth.role)) {
    return NextResponse.json({ error: 'Only managers can create tasks' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error.format() }, { status: 400 });
    }

    const { title, description, areaId, assigneeId, deadline } = result.data;

    // Get the highest position in BACKLOG for this area
    const lastTask = await prisma.task.findFirst({
      where: { areaId, status: 'BACKLOG' },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (lastTask?.position ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        areaId,
        createdById: auth.userId,
        assigneeId: assigneeId || null,
        deadline: deadline ? new Date(deadline) : null,
        position: nextPosition,
        status: 'BACKLOG',
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        area: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create Task Error:', error);
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 });
  }
}
