import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getAuthSession();

    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!['MANAGER', 'PROFESSOR'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Acesso Negado: Apenas gestores podem aprovar usuários.' }, { status: 403 });
    }

    const userId = params.id;

    // Atualiza o usuário alvo para active: true
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { active: true },
      select: { id: true, name: true, email: true, active: true } // Não devolve a senha
    });

    return NextResponse.json({ message: 'Usuário aprovado com sucesso!', user: updatedUser }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Falha na validação ou usuário não encontrado.' }, { status: 500 });
  }
}
