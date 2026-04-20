import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

import { getAuthSession } from '@/lib/auth';

const createReportSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title too long'),
  areaId: z.string().uuid(),
  content: z.string().min(1, 'Report content is required'),
  isoWeek: z.string().regex(/^\d{4}-W\d{2}$/, 'Invalid week format (Ex: 2026-W15)'), 
  attachments: z.array(z.object({
    type: z.enum(['VIDEO', 'PDF', 'IMAGE']),
    url: z.string(),
    filename: z.string(),
    sizeBytes: z.number().int()
  })).optional().default([])
});

export async function GET(req: Request) {
  const authPayload = getAuthSession();
  if (!authPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return list of reports
  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get('areaId');
  const isoWeek = searchParams.get('isoWeek');

  try {
    const reports = await prisma.report.findMany({
      where: {
        ...(areaId && { areaId }),
        ...(isoWeek && { isoWeek }),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        area: true,
        attachments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Fetch Reports Error:', error);
    return NextResponse.json({ error: 'Error fetching reports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authPayload = getAuthSession();
  if (!authPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = createReportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error.format() }, { status: 400 });
    }

    const { title, areaId, content, isoWeek, attachments } = result.data;

    // Check for duplicate report by area, author and isoWeek
    const existing = await prisma.report.findUnique({
      where: {
        authorId_areaId_isoWeek: {
          authorId: authPayload.userId,
          areaId,
          isoWeek
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted a report for this area this week.' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        authorId: authPayload.userId,
        areaId,
        title,
        content,
        isoWeek,
        status: 'SUBMITTED', // Defaults to DRAFT by prisma, but we set SUBMITTED for direct sends
        attachments: {
          create: attachments,
        }
      }
    });

    return NextResponse.json({ message: 'Report created successfully', report }, { status: 201 });
  } catch (error) {
    console.error('Create Report Error:', error);
    return NextResponse.json({ error: 'Error creating report' }, { status: 500 });
  }
}
