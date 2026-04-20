import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };

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
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await req.json();
    const { name, bio } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome deve ter ao menos 2 caracteres.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name.trim(),
        bio: bio?.trim() || null,
      },
      select: { id: true, name: true, bio: true, email: true, role: true, active: true }
    });

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
