import React from 'react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('auth_token')?.value;
  let role = 'MEMBER';
  let userName = '';
  let avatarUrl: string | null = null;
  
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { role: string, userId: string, name?: string };
      role = payload.role;
      userName = payload.name || 'Member';

      // Fetch fresh avatar from database (not from JWT which is static)
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { avatarUrl: true, name: true }
      });

      if (user) {
        avatarUrl = user.avatarUrl || null;
        userName = user.name || userName;
      }
    } catch {
      // Token verification failed
    }
  }

  return (
    <DashboardShell role={role} userName={userName} avatarUrl={avatarUrl}>
      {children}
    </DashboardShell>
  );
}
