import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const payload = getAuthSession();
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['MANAGER', 'PROFESSOR'].includes(payload.role)) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const meetings = await prisma.meeting.findMany({
      orderBy: { date: 'asc' },
      include: {
        attendance: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });

    // Generate CSV
    const lines: string[] = ['Meeting,Date,Member,Email,Present'];
    for (const meeting of meetings) {
      const dateStr = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(meeting.date));
      for (const att of (meeting as { attendance: Array<{ present: boolean; user: { name: string; email: string } }> }).attendance) {
        const present = att.present ? 'Yes' : 'No';
        // Escape quotes in text fields
        const title = `"${meeting.title.replace(/"/g, '""')}"`;
        const name = `"${att.user.name.replace(/"/g, '""')}"`;
        lines.push(`${title},${dateStr},${name},${att.user.email},${present}`);
      }
    }

    const csv = lines.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="attendance-tvgph-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error generating report' }, { status: 500 });
  }
}
