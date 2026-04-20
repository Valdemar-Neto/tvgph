import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    if (payload.role !== 'MANAGER') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

    const meetings = await prisma.meeting.findMany({
      orderBy: { date: 'asc' },
      include: {
        attendance: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });

    // Montar CSV
    const lines: string[] = ['Reunião,Data,Membro,Email,Presente'];
    for (const meeting of meetings) {
      const dateStr = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(meeting.date));
      for (const att of (meeting as any).attendance) {
        const present = att.present ? 'Sim' : 'Não';
        // Escapar vírgulas nos campos de texto
        const title = `"${meeting.title.replace(/"/g, '""')}"`;
        const name = `"${att.user.name.replace(/"/g, '""')}"`;
        lines.push(`${title},${dateStr},${name},${att.user.email},${present}`);
      }
    }

    const csv = lines.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="presencas-tvgph-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
  }
}
