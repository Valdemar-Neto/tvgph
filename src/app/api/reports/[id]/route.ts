import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

function getAuth() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth();
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { area: true, attachments: true }
  });
  if (!report) return NextResponse.json({ error: 'Report não encontrado' }, { status: 404 });

  // Apenas o autor ou gerente pode ver
  if (report.authorId !== auth.userId && auth.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  return NextResponse.json({ report });
}


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth();
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: 'Report não encontrado' }, { status: 404 });

  // Apenas o autor pode editar; gerente pode marcar como REVIEWED
  if (report.authorId !== auth.userId && auth.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const body = await req.json();

  // Gerente marcando como REVIEWED
  if (auth.role === 'MANAGER' && body.status) {
    const updated = await prisma.report.update({
      where: { id: params.id },
      data: { status: body.status }
    });
    return NextResponse.json({ report: updated });
  }

  // Autor editando conteúdo
  const { content } = body;
  if (!content) return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 });

  const updated = await prisma.report.update({
    where: { id: params.id },
    data: { content }
  });
  return NextResponse.json({ report: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth();
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: 'Report não encontrado' }, { status: 404 });

  if (report.authorId !== auth.userId && auth.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  await prisma.report.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Report removido com sucesso' });
}
