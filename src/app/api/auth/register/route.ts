import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  areaIds: z.array(z.string().uuid()).optional(),
  avatarUrl: z.string().url().nullish(),
});

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const messages: string[] = [];
      if (fieldErrors.name) messages.push('Nome é obrigatório');
      if (fieldErrors.email) messages.push('E-mail inválido');
      if (fieldErrors.password) messages.push('A senha deve ter no mínimo 8 caracteres');
      if (fieldErrors.areaIds) messages.push('IDs de área inválidos');
      if (fieldErrors.avatarUrl) messages.push('URL do avatar inválida');
      return NextResponse.json({ error: messages.join('. ') || 'Preencha os campos de cadastro corretamente', details: result.error.format() }, { status: 400 });
    }

    const { name, email, password, areaIds, avatarUrl } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'This email is already in use' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatarUrl,
        active: false, // Members remain inactive until Manager approval
      },
    });

    // Connect areas via UserArea if provided
    if (areaIds && areaIds.length > 0) {
      await prisma.userArea.createMany({
        data: areaIds.map(areaId => ({
          userId: user.id,
          areaId: areaId
        }))
      });
    }

    return NextResponse.json({ 
      message: 'User registered successfully. Please wait for manager approval.', 
      user: { id: user.id, name: user.name, email: user.email } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Erro ao registrar usuário' }, { status: 500 });
  }
}
