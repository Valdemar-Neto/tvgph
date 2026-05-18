import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');

    if (typeParam && typeParam !== 'HARD' && typeParam !== 'SOFT') {
      return NextResponse.json({ error: 'Invalid type parameter. Must be HARD or SOFT.' }, { status: 400 });
    }

    const skills = await prisma.skill.findMany({
      where: typeParam ? { type: typeParam as 'HARD' | 'SOFT' } : {},
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ skills }, { status: 200 });
  } catch (error) {
    console.error('GET /api/skills error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

const createSkillSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['HARD', 'SOFT'])
});

export async function POST(request: Request) {
  try {
    const session = getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'MANAGER' && session.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const result = createSkillSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation error', details: result.error.format() }, { status: 400 });
    }

    const { name, type } = result.data;

    // Case-insensitive uniqueness check
    const existing = await prisma.skill.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Skill already exists' }, { status: 400 });
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        type
      }
    });

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error('POST /api/skills error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
