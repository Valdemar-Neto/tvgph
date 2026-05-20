import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { z } from 'zod';

const reorderSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    status: z.enum(['BACKLOG', 'DO', 'DOING', 'DONE']),
    position: z.number().int().min(0),
  })).min(1).max(100),
});

// PATCH /api/tasks/reorder — Batch update positions after drag & drop
export async function PATCH(req: Request) {
  const auth = getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only managers and professors can reorder tasks
  if (!['MANAGER', 'PROFESSOR'].includes(auth.role)) {
    return NextResponse.json({ error: 'Only managers can reorder tasks' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = reorderSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const messages: string[] = [];
      if (fieldErrors.updates) messages.push('Lista de atualizações inválida — envie um array com id, status e position para cada tarefa');
      return NextResponse.json({ error: messages.join('. ') || 'Dados de reordenação inválidos', details: result.error.format() }, { status: 400 });
    }

    const { updates } = result.data;

    // Use a transaction to ensure atomicity
    await prisma.$transaction(
      updates.map(({ id, status, position }) =>
        prisma.task.update({
          where: { id },
          data: { status, position },
        })
      )
    );

    return NextResponse.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder Tasks Error:', error);
    return NextResponse.json({ error: 'Error reordering tasks' }, { status: 500 });
  }
}
