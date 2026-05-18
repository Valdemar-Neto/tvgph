import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'MANAGER' && session.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    const skill = await prisma.skill.findUnique({
      where: { id }
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    await prisma.skill.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Skill removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/skills/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
