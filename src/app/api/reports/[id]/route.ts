import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import r2Client from '@/lib/r2';
import { getISOWeekString } from '@/lib/utils';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { area: true, attachments: true }
  });
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  // Only author or manager can view
  if (report.authorId !== auth.userId && !['MANAGER', 'PROFESSOR'].includes(auth.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  return NextResponse.json({ report });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  const body = await req.json();

  // 1. Manager/Professor has full permission (including changing status)
  if (['MANAGER', 'PROFESSOR'].includes(auth.role)) {
    const updated = await prisma.report.update({
      where: { id: params.id },
      data: { 
        ...(body.content && { content: body.content }),
        ...(body.status && { status: body.status })
      }
    });
    return NextResponse.json({ report: updated });
  }

  // 2. Rules for Members
  if (auth.role === 'MEMBER') {
    // Can only edit their own report
    if (report.authorId !== auth.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const currentWeek = getISOWeekString(new Date());
    const isCurrentWeek = report.isoWeek === currentWeek;

    // Editing Lock: Only edit if it's the current week AND status is SUBMITTED
    // (If the manager reopened a last week's report, status goes back to SUBMITTED.
    // To simplify and allow functional reopening, we allow if SUBMITTED)
    if (report.status === 'REVIEWED') {
      return NextResponse.json({ error: 'This report has already been reviewed and is frozen.' }, { status: 403 });
    }

    if (!isCurrentWeek && report.status !== 'SUBMITTED') {
       return NextResponse.json({ error: 'The editing deadline for this week has expired.' }, { status: 403 });
    }

    const { content } = body;
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: { content }
    });
    return NextResponse.json({ report: updated });
  }

  return NextResponse.json({ error: 'Permission error' }, { status: 403 });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const report = await prisma.report.findUnique({ 
    where: { id: params.id },
    include: { attachments: true }
  });
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  if (report.authorId !== auth.userId && !['MANAGER', 'PROFESSOR'].includes(auth.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Physical cleanup in Cloudflare R2
  const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

  if (BUCKET_NAME && report.attachments.length > 0) {
    for (const file of report.attachments) {
      try {
        // Extract KEY from URL (part after the domain)
        let key = '';
        if (PUBLIC_URL && file.url.includes(PUBLIC_URL)) {
          key = file.url.split(`${PUBLIC_URL}/`)[1];
        } else if (file.url.includes('.com/')) {
          key = file.url.split('.com/')[1];
        }

        if (key) {
          await r2Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          }));
        }
      } catch (err) {
        console.error(`Error deleting file from R2 (${file.url}):`, err);
      }
    }
  }

  await prisma.report.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Report and associated files removed successfully' });
}
