import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const decoded = getAuthSession();

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        active: true,
        userAreas: {
          include: {
            area: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const decoded = getAuthSession();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, bio, avatarUrl } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name.trim(),
        bio: bio?.trim() || null,
        avatarUrl: avatarUrl || undefined,
      },
      select: { id: true, name: true, bio: true, email: true, role: true, active: true, avatarUrl: true }
    });

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}
