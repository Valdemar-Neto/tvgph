'use server';

import prisma from '@/lib/prisma';
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

/**
 * Toggles a like on a report
 */
export async function toggleLikeAction(reportId: string) {
  const payload = getAuthPayload();
  if (!payload) return { error: 'Access Denied.' };

  const userId = payload.userId;

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        reportId_userId: { reportId, userId }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
    } else {
      await prisma.like.create({
        data: { reportId, userId }
      });
    }

    revalidatePath('/tvgph');
    revalidatePath(`/tvgph/${reportId}`);
    return { success: true, liked: !existingLike };
  } catch (err: any) {
    return { error: 'Failed to process reaction.' };
  }
}

/**
 * Posts a new comment
 */
export async function postCommentAction(reportId: string, content: string) {
  const payload = getAuthPayload();
  if (!payload) return { error: 'Access Denied.' };

  if (!content || content.trim().length === 0) {
    return { error: 'Comment cannot be empty.' };
  }

  const userId = payload.userId;

  try {
    await prisma.comment.create({
      data: {
        reportId,
        userId,
        content: content.trim()
      }
    });

    revalidatePath(`/tvgph/${reportId}`);
    return { success: true };
  } catch (err: any) {
    return { error: 'Failed to post comment.' };
  }
}

/**
 * Deletes a comment
 */
export async function deleteCommentAction(commentId: string) {
  const payload = getAuthPayload();
  if (!payload) return { error: 'Access Denied.' };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) return { error: 'Comment not found.' };

    // Only the author or managers can delete
    if (comment.userId !== payload.userId && !['MANAGER', 'PROFESSOR'].includes(payload.role)) {
      return { error: 'Permission denied to delete this comment.' };
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    revalidatePath(`/tvgph/${comment.reportId}`);
    return { success: true };
  } catch (err: any) {
    return { error: 'Failed to delete comment.' };
  }
}
