import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skillParam = searchParams.get('skill');
    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search');

    const where: Prisma.UserWhereInput = {
      active: true
    };

    if (searchParam) {
      where.name = {
        contains: searchParam,
        mode: 'insensitive'
      };
    }

    if (skillParam) {
      where.userSkills = {
        some: {
          skillId: skillParam
        }
      };
    } else if (typeParam === 'HARD' || typeParam === 'SOFT') {
      where.userSkills = {
        some: {
          skill: {
            type: typeParam
          }
        }
      };
    }

    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        active: true,
        createdAt: true,
        userSkills: {
          include: {
            skill: true
          }
        },
        userAreas: {
          include: {
            area: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error('GET /api/members error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
