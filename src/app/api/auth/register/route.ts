import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  areaIds: z.array(z.string().uuid()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: result.error.format() }, { status: 400 });
    }

    const { name, email, password, areaIds } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        active: false, // Membros ficam inativos até aprovação do Gerente
      },
    });

    // Se areas foram enviadas, conectar via UserArea
    if (areaIds && areaIds.length > 0) {
      await prisma.userArea.createMany({
        data: areaIds.map(areaId => ({
          userId: user.id,
          areaId: areaId
        }))
      });
    }

    return NextResponse.json({ 
      message: 'Usuário registrado com sucesso. Aguarde a aprovação do gerente.', 
      user: { id: user.id, name: user.name, email: user.email } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o registro' }, { status: 500 });
  }
}
