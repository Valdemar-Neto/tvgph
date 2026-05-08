import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { z } from 'zod';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['BACKLOG', 'DO', 'DOING', 'DONE']).optional(),
  position: z.number().int().min(0).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
});

// PATCH /api/tasks/[id] — Update a task
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only managers and professors can update tasks
  if (!['MANAGER', 'PROFESSOR'].includes(auth.role)) {
    return NextResponse.json({ error: 'Only managers can update tasks' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error.format() }, { status: 400 });
    }

    const { title, description, status, position, assigneeId, deadline } = result.data;

    // Build update data dynamically
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (position !== undefined) updateData.position = position;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        area: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ error: 'Error updating task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] — Delete a task (MANAGER/PROFESSOR only)
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!['MANAGER', 'PROFESSOR'].includes(auth.role)) {
    return NextResponse.json({ error: 'Only managers can delete tasks' }, { status: 403 });
  }

  try {
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return NextResponse.json({ error: 'Error deleting task' }, { status: 500 });
  }
}
