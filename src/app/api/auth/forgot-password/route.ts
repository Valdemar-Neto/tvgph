import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Retornar 200 mesmo se não achar, por segurança (evita fishing de base de dados)
      return NextResponse.json({ message: 'Se o e-mail existir, um link foi enviado.' }, { status: 200 });
    }

    // Gerar token seguro genérico do Node (tamanho 32 bytes em HEX)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hora de validade

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpires: tokenExpires
      }
    });

    // MOCK: Num ambiente real trocaríamos pelo Client do Resend ou AWS SES
    const resetUrl = `http://localhost:3000/redefinir-senha?token=${resetToken}`;
    console.log(`\n==============================================`);
    console.log(`🚨 MOCK DE E-MAIL (TVGPH RECUPERAÇÃO) 🚨`);
    console.log(`Para: ${user.name} <${user.email}>`);
    console.log(`Mensagem: Olá, clique no link abaixo para recuperar sua senha:`);
    console.log(`${resetUrl}`);
    console.log(`==============================================\n`);

    return NextResponse.json({ message: 'Se o e-mail existir, um link foi enviado.' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar solicitação.' }, { status: 500 });
  }
}
