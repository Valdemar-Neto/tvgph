'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

function getManagerId(): string | null {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    if (payload.role !== 'MANAGER') return null;
    return payload.userId;
  } catch {
    return null;
  }
}

// 1. Criar Encontro Físico e gerar chamada inicial para todos os membros ativos
export async function createMeetingAction(formData: FormData) {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Acesso Negado.' };

  const title = formData.get('title') as string;
  const dateStr = formData.get('date') as string;
  if (!title || !dateStr) return { error: 'Preencha título e data.' };

  try {
    const meeting = await prisma.meeting.create({
      data: { title, date: new Date(dateStr), createdBy: managerId }
    });

    const users = await prisma.user.findMany({ where: { active: true } });

    if (users.length > 0) {
      await prisma.attendance.createMany({
        data: users.map((u: { id: string }) => ({
          meetingId: meeting.id,
          userId: u.id,
          present: false
        }))
      });
    }

    revalidatePath('/dashboard/presenca');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// 2. Registrar ou remover presença individual
export async function toggleAttendanceAction(attendanceId: string, present: boolean) {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Acesso Negado.' };

  try {
    await prisma.attendance.update({ where: { id: attendanceId }, data: { present } });
    revalidatePath('/dashboard/presenca/[id]', 'page');
    return { success: true };
  } catch {
    return { error: 'Erro ao registrar presença.' };
  }
}

// 3. Controlar role e status ativo do membro
export async function updateUserRoleAction(userId: string, active: boolean, role: 'MEMBER' | 'MANAGER') {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Acesso Negado.' };

  try {
    await prisma.user.update({ where: { id: userId }, data: { active, role } });
    revalidatePath('/dashboard/membros');
    return { success: true };
  } catch {
    return { error: 'Erro ao modificar permissão.' };
  }
}

// 4. Aprovar novo membro: ativa perfil + vincula área(s) em transação atômica
export async function approveUserAction(userId: string, areaIds: string[]) {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Acesso Negado.' };
  if (!areaIds || areaIds.length === 0) return { error: 'Selecione ao menos uma área para o membro.' };

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({ where: { id: userId }, data: { active: true } });
      await tx.userArea.deleteMany({ where: { userId } });
      await tx.userArea.createMany({
        data: areaIds.map((areaId) => ({ userId, areaId }))
      });
    });

    revalidatePath('/dashboard/membros');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Erro ao aprovar membro.' };
  }
}
