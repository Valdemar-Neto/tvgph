import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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

    // Generate specific generic Node secure token (32 bytes in HEX)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour validity

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpires: tokenExpires
      }
    });

    // MOCK: In a real environment we would use Resend or AWS SES Client
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    console.log(`\n==============================================`);
    console.log(`🚨 E-MAIL MOCK (TVGPH RECOVERY) 🚨`);
    console.log(`To: ${user.name} <${user.email}>`);
    console.log(`Message: Hello, click the link below to recover your password:`);
    console.log(`${resetUrl}`);
    console.log(`==============================================\n`);

    return NextResponse.json({ message: 'If the email exists, a link has been sent.' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Error processing request.' }, { status: 500 });
  }
}
