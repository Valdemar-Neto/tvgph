import React from 'react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { DashboardShell } from '@/components/layout/DashboardShell';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('auth_token')?.value;
  let role = 'MEMBER';
  let userName = '';
  let avatarUrl: string | null = null;
  
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { role: string, userId: string, name?: string, avatarUrl?: string | null };
      role = payload.role;
      userName = payload.name || 'Member';
      avatarUrl = payload.avatarUrl || null;
    } catch {
      // Falha ao verifcar token
    }
  }

  return (
    <DashboardShell role={role} userName={userName} avatarUrl={avatarUrl}>
      {children}
    </DashboardShell>
  );
}
