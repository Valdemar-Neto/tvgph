import React from 'react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getISOWeekString } from '@/lib/utils';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('auth_token')?.value;
  let role = 'MEMBER';
  let userId = '';
  let userName = '';
  let avatarUrl: string | null = null;
  
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { role: string, userId: string, name?: string, avatarUrl?: string | null };
      role = payload.role;
      userId = payload.userId;
      userName = payload.name || 'Member';
      avatarUrl = payload.avatarUrl || null;
    } catch (e) {
      // Falha ao verifcar token
    }
  }

  // Verificar se usuário submeteu report na atual semana ISO
  let hasReportedThisWeek = true; 
  if (userId && role === 'MEMBER') {
     const currentStr = getISOWeekString(new Date());
     const count = await prisma.report.count({
        where: {
           authorId: userId,
           isoWeek: currentStr
        }
     });
     hasReportedThisWeek = count > 0;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50">
      
      {/* Sidebar Inteligente Client Component */}
      <Sidebar role={role} hasReportedThisWeek={hasReportedThisWeek} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header userName={userName} avatarUrl={avatarUrl} role={role} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-[1400px] mx-auto w-full p-8 md:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
