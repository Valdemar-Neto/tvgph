import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Returning 200 even if not found for security (avoids database fishing)
      return NextResponse.json({ message: 'If the email exists, a link has been sent.' }, { status: 200 });
    }

    // Rate Limiting: 1 minute cooldown
    if (user.lastResetRequestAt) {
      const cooldownTime = 1 * 60 * 1000; // 1 minute
      const timeSinceLastRequest = Date.now() - new Date(user.lastResetRequestAt).getTime();
      
      if (timeSinceLastRequest < cooldownTime) {
        const secondsLeft = Math.ceil((cooldownTime - timeSinceLastRequest) / 1000);
        return NextResponse.json({ 
          error: `Please wait ${secondsLeft} seconds before requesting a new link.` 
        }, { status: 429 }); // 429 is Too Many Requests
      }
    }

    // Generate specific generic Node secure token (32 bytes in HEX)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour validity

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpires: tokenExpires,
        lastResetRequestAt: new Date()
      }
    });

    // Real Email Sending via Gmail SMTP
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const { success, error } = await sendEmail({
      to: email,
      subject: 'RECOVERY PROTOCOL: Password Reset Required',
      html: `
        <div style="background-color: #030712; padding: 40px; font-family: 'Courier New', Courier, monospace; color: #94a3b8; border: 1px solid #1e293b; max-width: 600px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0; letter-spacing: -1px; font-weight: 900; font-style: italic; text-transform: uppercase;">GPH <span style="color: #3b82f6;">REPORT</span></h1>
            <p style="font-size: 10px; color: #3b82f6; text-transform: uppercase; margin-top: 5px; letter-spacing: 3px; font-weight: bold;">Security & Access Verification Dept</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #f8fafc;">Um pedido de redefinição de senha foi detectado para sua conta no GPH REPORT.</p>
            
            <div style="background-color: #0f172a; padding: 20px; border-left: 4px solid #3b82f6; margin: 25px 0;">
              <p style="margin: 0; font-size: 11px; color: #3b82f6; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">STATUS DO PROTOCOLO: RECUPERAÇÃO PENDENTE</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #ffffff;">Por favor, acesse o link abaixo para estabelecer novas credenciais de segurança.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 18px 36px; text-decoration: none; font-weight: 900; border-radius: 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Clique aqui</a>
          </div>
          
          <div style="border-top: 1px solid #1e293b; padding-top: 30px; margin-top: 40px;">
            <p style="font-size: 12px; margin-bottom: 10px;">Este link expirará automaticamente em <strong style="color: #ffffff;">60 minutos</strong>.</p>
            <p style="font-size: 11px; color: #475569;">Se você não solicitou esta redefinição, por favor ignore este comunicado. Sua conta permanece sob criptografia padrão.</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="font-size: 9px; color: #1e293b; text-transform: uppercase; letter-spacing: 2px;">© 2026 GPH LABS | TECH GENERATIVE SYSTEMS</p>
          </div>
        </div>
      `
    });

    if (!success) {
      console.error('Nodemailer Error:', error);
      return NextResponse.json({ error: 'Erro ao processar envio de e-mail via SMTP.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Se o e-mail existir, um link foi enviado.' }, { status: 200 });

  } catch (err) {
    console.error('Forgot Password Route Error:', err);
    return NextResponse.json({ error: 'Falha ao processar solicitação.' }, { status: 500 });
  }
}
