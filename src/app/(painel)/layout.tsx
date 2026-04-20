import React from 'react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

function getISOWeekString(d: Date) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const diff = (date.getTime() - week1.getTime()) / 86400000;
  const week = 1 + Math.round(diff / 7);
  return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('auth_token')?.value;
  let role = 'MEMBER';
  let userId = '';
  
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { role: string, userId: string };
      role = payload.role;
      userId = payload.userId;
    } catch (e) {
      // Falha ao verifcar token
    }
  }

  // Verificar se usuário submeteu report na atual semana ISO
  let hasReportedThisWeek = true; // Por padrao esconde
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
    <div className="flex h-screen w-full flex-col md:flex-row bg-muted/20">
      
      {/* Sidebar Inteligente Client Component */}
      <Sidebar role={role} hasReportedThisWeek={hasReportedThisWeek} />

      {/* Main Content Área */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
