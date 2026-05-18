import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true
      }
    });

    return NextResponse.json({ skills: userSkills }, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/[id]/skills error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

const updateSkillsSchema = z.object({
  skillIds: z.array(z.string().uuid()).max(10, { message: 'Maximum of 10 skills allowed' })
});

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Authorization: only the owner or manager/professor
    if (session.userId !== userId && session.role !== 'MANAGER' && session.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const result = updateSkillsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: result.error.format()
      }, { status: 400 });
    }

    const { skillIds } = result.data;

    // Verify all skillIds exist in catalog
    if (skillIds.length > 0) {
      const skillsInDb = await prisma.skill.findMany({
        where: {
          id: { in: skillIds }
        },
        select: { id: true }
      });

      if (skillsInDb.length !== skillIds.length) {
        return NextResponse.json({ error: 'One or more skills do not exist in the catalogue' }, { status: 400 });
      }
    }

    // Replace all existing skill assignments using a transaction
    await prisma.$transaction([
      prisma.userSkill.deleteMany({
        where: { userId }
      }),
      ...(skillIds.length > 0 ? [
        prisma.userSkill.createMany({
          data: skillIds.map(skillId => ({
            userId,
            skillId
          }))
        })
      ] : [])
    ]);

    // Fetch the updated skills to return
    const updatedUserSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true
      }
    });

    return NextResponse.json({ skills: updatedUserSkills }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/users/[id]/skills error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
