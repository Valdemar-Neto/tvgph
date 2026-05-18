import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { z } from 'zod';

const updateSkillsSchema = z.object({
  skillIds: z.array(z.string().uuid()).max(10, 'Maximum of 10 skills allowed')
});

export async function PUT(request: Request) {
  try {
    const session = getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = session;

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

    // Use a transaction to update user skills cleanly
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing user skills
      await tx.userSkill.deleteMany({
        where: { userId }
      });

      // 2. Add new user skills
      if (skillIds.length > 0) {
        await tx.userSkill.createMany({
          data: skillIds.map(skillId => ({
            userId,
            skillId
          }))
        });
      }
    });

    // Fetch and return the updated user skills
    const updatedSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true
      }
    });

    return NextResponse.json({
      message: 'Skills updated successfully',
      skills: updatedSkills.map(us => us.skill)
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/users/skills error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
