'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

function getAuthPayload(): { userId: string, role: string } | null {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
  } catch {
    return null;
  }
}

function getManagerId(): string | null {
  const payload = getAuthPayload();
  if (!payload || !['MANAGER', 'PROFESSOR'].includes(payload.role)) return null;
  return payload.userId;
}

function getProfessorId(): string | null {
  const payload = getAuthPayload();
  if (!payload || payload.role !== 'PROFESSOR') return null;
  return payload.userId;
}

// 1. Create Physical Meeting and generate initial attendance for all active members
export async function createMeetingAction(formData: FormData) {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Access Denied.' };

  const title = formData.get('title') as string;
  const dateStr = formData.get('date') as string;
  if (!title || !dateStr) return { error: 'Please provide title and date.' };

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

    revalidatePath('/dashboard/presence');
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

// 2. Register or remove individual attendance
export async function toggleAttendanceAction(attendanceId: string, present: boolean) {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Access Denied.' };

  try {
    await prisma.attendance.update({ where: { id: attendanceId }, data: { present } });
    revalidatePath('/dashboard/presence/[id]', 'page');
    return { success: true };
  } catch {
    return { error: 'Error registering attendance.' };
  }
}

// 3. Control member role and active status
export async function updateUserRoleAction(userId: string, active: boolean, role: 'MEMBER' | 'MANAGER' | 'PROFESSOR') {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Access Denied.' };

  try {
    await prisma.user.update({ where: { id: userId }, data: { active, role } });
    revalidatePath('/dashboard/members');
    return { success: true };
  } catch {
    return { error: 'Error modifying permission.' };
  }
}

// 3.5 Permanently delete member (PROFESSOR ONLY)
export async function deleteUserAction(userId: string) {
  const professorId = getProfessorId();
  if (!professorId) return { error: 'Access Denied. Only the Main Manager can delete researchers.' };

  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/dashboard/members');
    return { success: true };
  } catch {
    return { error: 'Error deleting member. Ensure they have no linked records.' };
  }
}

// 4. Approve new member: activates profile + links to areas in atomic transaction
export async function approveUserAction(userId: string, areaIds: string[]) {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Access Denied.' };
  if (!areaIds || areaIds.length === 0) return { error: 'Select at least one area for the member.' };

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({ where: { id: userId }, data: { active: true } });
      await tx.userArea.deleteMany({ where: { userId } });
      await tx.userArea.createMany({
        data: areaIds.map((areaId) => ({ userId, areaId }))
      });
    });

    revalidatePath('/dashboard/members');
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || 'Error approving member.' };
  }
}

// 5. Mark a report as reviewed (Manager/Professor)
export async function reviewReportAction(reportId: string) {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Access Denied.' };

  try {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'REVIEWED' }
    });
    revalidatePath('/tvgph');
    revalidatePath('/dashboard');
    revalidatePath(`/tvgph/${reportId}`);
    return { success: true };
  } catch {
    return { error: 'Failed to update report status.' };
  }
}
// 6. Reopen a report for editing (Manager/Professor)
export async function reopenReportAction(reportId: string) {
  const managerId = getManagerId();
  if (!managerId) return { error: 'Access Denied.' };

  try {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'SUBMITTED' }
    });
    revalidatePath('/tvgph');
    revalidatePath(`/tvgph/${reportId}`);
    return { success: true };
  } catch {
    return { error: 'Failed to reopen report.' };
  }
}

// 7. Permanently delete area (PROFESSOR ONLY)
export async function deleteAreaAction(areaId: string) {
  const professorId = getProfessorId();
  if (!professorId) return { error: 'Access Denied. Only the Main Manager can delete areas.' };

  try {
    await prisma.area.delete({ where: { id: areaId } });
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { error: 'Error deleting area. Check if there are members or reports linked to it.' };
  }
}

// 8. Get list of reports pending review (MANAGER/PROFESSOR)
export async function getPendingReportsAction() {
  const managerId = getManagerId();
  if (!managerId) return null;

  try {
    const reports = await prisma.report.findMany({
      where: { status: 'SUBMITTED' },
      include: {
        author: { select: { name: true } },
        area: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports.map(r => ({
      id: r.id,
      title: r.title,
      authorName: r.author.name,
      areaName: r.area.name,
      isoWeek: r.isoWeek
    }));
  } catch (e) {
    console.error('ERROR_GET_PENDING_REPORTS:', e);
    return [];
  }
}
