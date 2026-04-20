import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Decodifica o token para verificar se é MANAGER
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };

    if (decoded.role !== 'MANAGER') {
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
