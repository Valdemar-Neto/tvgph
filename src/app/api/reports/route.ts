import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

function authenticate(req: Request) {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
  } catch {
    return null;
  }
}

const createReportSchema = z.object({
  areaId: z.string().uuid(),
  content: z.string().min(1, 'O conteúdo do report é obrigatório'),
  isoWeek: z.string() // ex: "2025-W22"
});

export async function GET(req: Request) {
  // Retornar lista de reports
  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get('areaId');
  const isoWeek = searchParams.get('isoWeek');

  try {
    const reports = await prisma.report.findMany({
      where: {
        ...(areaId && { areaId }),
        ...(isoWeek && { isoWeek }),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        area: true,
        attachments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Fetch Reports Error:', error);
    return NextResponse.json({ error: 'Erro ao buscar reports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authPayload = authenticate(req);
  if (!authPayload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = createReportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: result.error.format() }, { status: 400 });
    }

    const { areaId, content, isoWeek } = result.data;

    // Verificar duplicação de report por área, autor e isoWeek
    const existing = await prisma.report.findUnique({
      where: {
        authorId_areaId_isoWeek: {
          authorId: authPayload.userId,
          areaId,
          isoWeek
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Você já enviou um report para esta área nesta semana.' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        authorId: authPayload.userId,
        areaId,
        content,
        isoWeek,
        status: 'SUBMITTED' // Defaults to DRAFT by prisma, but we set SUBMITTED for direct sends
      }
    });

    return NextResponse.json({ message: 'Report criado com sucesso', report }, { status: 201 });
  } catch (error) {
    console.error('Create Report Error:', error);
    return NextResponse.json({ error: 'Erro ao criar report' }, { status: 500 });
  }
}
